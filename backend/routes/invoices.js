const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const notificationService = require('../services/notifications');
const logger = require('../utils/logger');

const router = express.Router();

// Get all invoices
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT i.*, 
             b.service_type, b.booking_date, b.hours,
             u.name as customer_name, u.email as customer_email
      FROM invoices i
      JOIN bookings b ON b.id = i.booking_id
      JOIN users u ON u.id = b.customer_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      sql += ` AND i.status = $${++paramCount}`;
      params.push(status);
    }

    sql += ` ORDER BY i.created_at DESC`;
    sql += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json({ invoices: result.rows });
  } catch (error) {
    logger.error('Get invoices error', { error: error.message });
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

// Create invoice for booking
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { booking_id, due_date_days = 14 } = req.body;
    
    // Get booking details
    const bookingResult = await query(
      `SELECT b.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Calculate amounts (25% VAT in Sweden)
    const amount = booking.total_price || 0;
    const taxAmount = amount * 0.25;
    const totalAmount = amount + taxAmount;

    // Generate invoice number
    const date = new Date();
    const invoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + due_date_days);

    const result = await query(
      `INSERT INTO invoices (booking_id, invoice_number, amount, tax_amount, total_amount, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [booking_id, invoiceNumber, amount, taxAmount, totalAmount, dueDate.toISOString().split('T')[0]]
    );

    const invoice = result.rows[0];

    // Send invoice notification
    try {
      await notificationService.sendNotification({
        userId: booking.customer_id,
        invoiceId: invoice.id,
        type: 'invoice',
        email: booking.customer_email,
        phone: booking.customer_phone,
        emailData: {
          invoiceId: invoice.id,
          customerName: booking.customer_name,
          amount: totalAmount,
          dueDate: invoice.due_date,
          swishNumber: process.env.SWISH_PHONE
        },
        smsData: {
          invoiceId: invoice.id,
          amount: totalAmount
        }
      });
    } catch (error) {
      logger.error('Invoice notification failed', { error: error.message });
    }

    res.status(201).json({
      message: 'Invoice created',
      invoice
    });
  } catch (error) {
    logger.error('Create invoice error', { error: error.message });
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

module.exports = router;
