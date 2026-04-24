const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all customers (admin only)
router.get('/', authenticate, authorize('admin', 'worker'), async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT u.id, u.email, u.name, u.phone, u.address, u.postcode, u.city, 
             u.created_at, u.active,
             c.preferred_contact, c.notes,
             (SELECT COUNT(*) FROM bookings WHERE customer_id = u.id) as total_bookings,
             (SELECT COUNT(*) FROM bookings WHERE customer_id = u.id AND status = 'completed') as completed_bookings
      FROM users u
      LEFT JOIN customers c ON c.user_id = u.id
      WHERE u.role = 'customer'
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      sql += ` AND (u.name ILIKE $${++paramCount} OR u.email ILIKE $${++paramCount} OR u.phone ILIKE $${++paramCount})`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY u.created_at DESC`;
    sql += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM users WHERE role = $1',
      ['customer']
    );

    res.json({
      customers: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Get customers error', { error: error.message });
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

// Get single customer with bookings
router.get('/:id', authenticate, authorize('admin', 'worker'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const customerResult = await query(
      `SELECT u.*, c.preferred_contact, c.notes
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = $1 AND u.role = 'customer'`,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get bookings
    const bookingsResult = await query(
      `SELECT * FROM bookings WHERE customer_id = $1 ORDER BY booking_date DESC`,
      [id]
    );

    res.json({
      customer: customerResult.rows[0],
      bookings: bookingsResult.rows
    });
  } catch (error) {
    logger.error('Get customer error', { error: error.message });
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

module.exports = router;
