const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const notificationService = require('../services/notifications');
const logger = require('../utils/logger');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Get available time slots
router.get('/available-slots', async (req, res) => {
  try {
    const { date, service_id } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get existing bookings for the date
    const existing = await query(
      'SELECT time_slot, worker_id FROM bookings WHERE booking_date = $1 AND status NOT IN ($2, $3)',
      [date, 'cancelled', 'completed']
    );

    // Generate time slots (8:00 - 17:00, 2-hour blocks)
    const allSlots = [
      '08:00', '10:00', '12:00', '14:00', '16:00'
    ];

    // Filter out booked slots
    const bookedSlots = existing.rows.map(b => b.time_slot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      date,
      availableSlots,
      bookedSlots
    });
  } catch (error) {
    logger.error('Get available slots error', { error: error.message });
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Create booking (public or authenticated)
router.post('/', [
  body('service_type').notEmpty().trim(),
  body('booking_date').isDate(),
  body('time_slot').notEmpty(),
  body('hours').isInt({ min: 1, max: 12 }),
  body('address').notEmpty().trim(),
  body('postcode').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('customer_name').notEmpty().trim(),
  body('customer_email').isEmail(),
  body('customer_phone').notEmpty(),
  validate
], async (req, res) => {
  try {
    const {
      service_type,
      booking_date,
      time_slot,
      hours,
      address,
      postcode,
      city,
      notes,
      customer_name,
      customer_email,
      customer_phone
    } = req.body;

    // Check if slot is still available
    const existing = await query(
      'SELECT id FROM bookings WHERE booking_date = $1 AND time_slot = $2 AND status NOT IN ($3, $4)',
      [booking_date, time_slot, 'cancelled', 'completed']
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ 
        error: 'This time slot is no longer available. Please select another time.' 
      });
    }

    // Get or create customer
    let customerId;
    let userResult;

    if (req.user) {
      customerId = req.user.id;
    } else {
      // Check if user exists
      userResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [customer_email]
      );

      if (userResult.rows.length > 0) {
        customerId = userResult.rows[0].id;
      } else {
        // Create guest user
        const salt = await require('bcryptjs').genSalt(12);
        const passwordHash = await require('bcryptjs').hash(Math.random().toString(36), salt);
        
        const newUser = await query(
          `INSERT INTO users (email, password_hash, name, phone, address, postcode, city, role)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'customer')
           RETURNING id`,
          [customer_email, passwordHash, customer_name, customer_phone, address, postcode, city]
        );
        
        customerId = newUser.rows[0].id;
        
        await query('INSERT INTO customers (user_id) VALUES ($1)', [customerId]);
      }
    }

    // Get service price
    let totalPrice = 0;
    const serviceResult = await query(
      'SELECT base_price, price_per_hour FROM services WHERE name = $1 AND active = true',
      [service_type]
    );
    
    if (serviceResult.rows.length > 0) {
      const service = serviceResult.rows[0];
      totalPrice = (service.base_price || 0) + ((service.price_per_hour || 0) * hours);
    } else {
      // Default pricing
      totalPrice = hours * 350; // 350 kr/hour default
    }

    // Create booking
    const result = await query(
      `INSERT INTO bookings (customer_id, service_type, booking_date, time_slot, hours, 
                            address, postcode, city, notes, status, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10)
       RETURNING *`,
      [customerId, service_type, booking_date, time_slot, hours, address, postcode, city, notes, totalPrice]
    );

    const booking = result.rows[0];

    // Get customer details for notification
    const customerResult = await query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [customerId]
    );
    const customer = customerResult.rows[0];

    // Send confirmation notifications
    try {
      await notificationService.sendBookingConfirmation(booking, customer);
    } catch (error) {
      logger.error('Booking confirmation notification failed', { error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        ...booking,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone
      }
    });
  } catch (error) {
    logger.error('Create booking error', { error: error.message });
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get all bookings (admin/worker) or customer bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, date_from, date_to, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT b.*, 
             c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
             w.name as worker_name
      FROM bookings b
      JOIN users c ON c.id = b.customer_id
      LEFT JOIN workers wr ON wr.id = b.worker_id
      LEFT JOIN users w ON w.id = wr.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Role-based filtering
    if (req.user.role === 'customer') {
      sql += ` AND b.customer_id = $${++paramCount}`;
      params.push(req.user.id);
    }

    if (status) {
      sql += ` AND b.status = $${++paramCount}`;
      params.push(status);
    }

    if (date_from) {
      sql += ` AND b.booking_date >= $${++paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND b.booking_date <= $${++paramCount}`;
      params.push(date_to);
    }

    sql += ` ORDER BY b.booking_date DESC, b.time_slot ASC`;
    sql += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) FROM bookings b WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'customer') {
      countSql += ` AND b.customer_id = $${++countParamCount}`;
      countParams.push(req.user.id);
    }

    const countResult = await query(countSql, countParams);

    res.json({
      bookings: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Get bookings error', { error: error.message });
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get single booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT b.*,
              c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
              w.name as worker_name
       FROM bookings b
       JOIN users c ON c.id = b.customer_id
       LEFT JOIN workers wr ON wr.id = b.worker_id
       LEFT JOIN users w ON w.id = wr.user_id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Check authorization
    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    logger.error('Get booking error', { error: error.message });
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

// Update booking
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get current booking
    const currentResult = await query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const current = currentResult.rows[0];

    // Check authorization
    if (req.user.role === 'customer' && current.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update query
    const allowedFields = ['service_type', 'booking_date', 'time_slot', 'hours', 
                           'address', 'postcode', 'city', 'notes', 'status', 
                           'worker_id', 'payment_status'];
    
    const setClause = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${++paramCount}`);
        values.push(value);
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE bookings SET ${setClause.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      values
    );

    const updated = result.rows[0];

    // Track changes for notification
    const changes = [];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && current[key] !== value) {
        changes.push({
          field: key,
          old: current[key],
          new: value
        });
      }
    }

    // Send update notification if there are changes
    if (changes.length > 0) {
      const customerResult = await query(
        'SELECT id, name, email, phone FROM users WHERE id = $1',
        [current.customer_id]
      );
      
      try {
        await notificationService.sendBookingUpdate(updated, customerResult.rows[0], changes);
      } catch (error) {
        logger.error('Booking update notification failed', { error: error.message });
      }
    }

    res.json({
      message: 'Booking updated',
      booking: updated
    });
  } catch (error) {
    logger.error('Update booking error', { error: error.message });
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Cancel booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentResult = await query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const current = currentResult.rows[0];

    if (req.user.role === 'customer' && current.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow cancellation if not completed
    if (current.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed booking' });
    }

    await query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    // Notify customer
    const customerResult = await query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [current.customer_id]
    );
    
    try {
      await notificationService.sendNotification({
        userId: current.customer_id,
        bookingId: id,
        type: 'bookingUpdate',
        email: customerResult.rows[0].email,
        phone: customerResult.rows[0].phone,
        emailData: {
          bookingId: id,
          customerName: customerResult.rows[0].name,
          changes: [{ field: 'status', old: current.status, new: 'cancelled' }]
        },
        smsData: { bookingId: id, date: current.booking_date, time: current.time_slot }
      });
    } catch (error) {
      logger.error('Cancellation notification failed', { error: error.message });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    logger.error('Cancel booking error', { error: error.message });
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
