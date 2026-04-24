const express = require('express');
const { query, transaction } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const notificationService = require('../services/notifications');
const logger = require('../utils/logger');

const router = express.Router();

// Get all invoices
router.get('/', authenticate, authorize('admin', 'worker'), async (req, res) => {
  try {
    const { status, is_rut, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT i.*, 
             COALESCE(b.service_type, '') as service_type,
             COALESCE(b.booking_date, '') as booking_date,
             COALESCE(b.hours, 0) as hours,
             u.name as customer_name, 
             u.email as customer_email,
             u.phone as customer_phone
      FROM invoices i
      LEFT JOIN bookings b ON b.id = i.booking_id
      LEFT JOIN users u ON u.id = COALESCE(i.customer_id, b.customer_id)
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      const statuses = status.split(',');
      if (statuses.length === 1) {
        sql += ` AND i.status = $${++paramCount}`;
        params.push(statuses[0]);
      } else {
        const placeholders = statuses.map(() => `$${++paramCount}`).join(',');
        sql += ` AND i.status IN (${placeholders})`;
        params.push(...statuses);
      }
    }

    if (is_rut === 'true') {
      sql += ` AND i.is_rut = 1`;
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

// Create standalone invoice (admin v2)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      customer_id,
      invoice_date,
      due_date,
      payment_terms,
      our_contact,
      customer_contact,
      is_rut,
      notes,
      line_items,
      totals
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    // Get customer details
    const custResult = await query(
      'SELECT name, email, phone FROM users WHERE id = $1 AND role = $2',
      [customer_id, 'customer']
    );
    if (custResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const customer = custResult.rows[0];

    // Get next invoice number from settings or generate
    const settingsResult = await query("SELECT value FROM settings WHERE key = 'next_invoice_number'");
    let nextNum = 1000;
    if (settingsResult.rows.length > 0) {
      nextNum = parseInt(settingsResult.rows[0].value) || 1000;
    }
    const invoiceNumber = nextNum.toString();
    
    // Update next invoice number
    await query(
      "INSERT INTO settings (key, value) VALUES ('next_invoice_number', $1) ON CONFLICT(key) DO UPDATE SET value = $1",
      [(nextNum + 1).toString()]
    );

    const totalAmount = totals?.total || line_items.reduce((sum, item) => sum + (item.total || 0), 0);
    const netAmount = totals?.netTotal || line_items.reduce((sum, item) => {
      const base = item.quantity * item.price;
      return sum + base * (1 - item.discount / 100);
    }, 0);
    const rutAmount = is_rut ? netAmount * 0.5 : 0;

    // Create invoice
    const result = await query(
      `INSERT INTO invoices (customer_id, invoice_number, invoice_date, amount, tax_amount, total_amount, 
        due_date, status, our_contact, customer_contact, is_rut, rut_amount, notes, remaining_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [customer_id, invoiceNumber, invoice_date, netAmount, totalAmount - netAmount, totalAmount,
       due_date, 'sent', our_contact, customer_contact, is_rut ? 1 : 0, rutAmount, notes, totalAmount]
    );

    const invoice = result.rows[0];

    // Create line items
    for (const item of line_items) {
      await query(
        `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit, price, discount, vat, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [invoice.id, item.description, item.quantity, item.unit, item.price, item.discount, item.vat, item.total]
      );
    }

    // Send notification
    try {
      await notificationService.sendNotification({
        userId: customer_id,
        invoiceId: invoice.id,
        type: 'invoice',
        email: customer.email,
        phone: customer.phone,
        emailData: {
          invoiceId: invoice.id,
          customerName: customer.name,
          amount: totalAmount,
          dueDate: due_date,
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
      invoice: { ...invoice, line_items }
    });
  } catch (error) {
    logger.error('Create invoice error', { error: error.message });
    res.status(500).json({ error: 'Failed to create invoice: ' + error.message });
  }
});

// Get invoice with line items
router.get('/:id', authenticate, authorize('admin', 'worker'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const invResult = await query(
      `SELECT i.*, u.name as customer_name, u.email as customer_email
       FROM invoices i
       LEFT JOIN users u ON u.id = i.customer_id
       WHERE i.id = $1`,
      [id]
    );

    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const lineItemsResult = await query(
      'SELECT * FROM invoice_line_items WHERE invoice_id = $1',
      [id]
    );

    res.json({
      invoice: invResult.rows[0],
      line_items: lineItemsResult.rows
    });
  } catch (error) {
    logger.error('Get invoice error', { error: error.message });
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

// Register payment on invoice
router.post('/:id/payment', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_date, payment_method, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Get current invoice
    const invResult = await query(
      'SELECT * FROM invoices WHERE id = $1',
      [id]
    );
    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice = invResult.rows[0];

    const newRemaining = Math.max(0, (invoice.remaining_amount || invoice.total_amount) - amount);
    const newStatus = newRemaining <= 0 ? 'paid' : (new Date(invoice.due_date) < new Date() ? 'overdue' : 'sent');

    await query(
      `UPDATE invoices SET remaining_amount = $1, status = $2, paid_at = $3 
       WHERE id = $4`,
      [newRemaining, newStatus, newRemaining <= 0 ? payment_date : null, id]
    );

    // Record payment transaction
    await query(
      `INSERT INTO payment_transactions (invoice_id, amount, payment_method, status, metadata)
       VALUES ($1, $2, $3, 'completed', $4)`,
      [id, amount, payment_method, JSON.stringify({ reference, payment_date })]
    );

    res.json({ 
      message: 'Payment registered',
      remaining: newRemaining,
      status: newStatus
    });
  } catch (error) {
    logger.error('Payment registration error', { error: error.message });
    res.status(500).json({ error: 'Failed to register payment' });
  }
});

// Send reminder
router.post('/:id/reminder', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reminder_type, days_after_due, message } = req.body;

    // Get invoice
    const invResult = await query(
      `SELECT i.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM invoices i
       LEFT JOIN users u ON u.id = i.customer_id
       WHERE i.id = $1`,
      [id]
    );
    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice = invResult.rows[0];

    // Save reminder record
    await query(
      `INSERT INTO reminders (invoice_id, reminder_type, days_after_due, message, status, sent_at)
       VALUES ($1, $2, $3, $4, 'sent', CURRENT_TIMESTAMP)`,
      [id, reminder_type, days_after_due, message]
    );

    // Send notifications
    const reminderMsg = message || `Påminnelse: Faktura ${invoice.invoice_number} på ${invoice.total_amount} kr är försenad.`;
    
    if (reminder_type === 'email' || reminder_type === 'both') {
      await notificationService.sendEmail({
        to: invoice.customer_email,
        subject: `Påminnelse: Faktura ${invoice.invoice_number}`,
        text: reminderMsg
      });
    }
    
    if (reminder_type === 'sms' || reminder_type === 'both') {
      await notificationService.sendSMS({
        to: invoice.customer_phone,
        message: reminderMsg.substring(0, 160)
      });
    }

    res.json({ message: 'Reminder sent' });
  } catch (error) {
    logger.error('Reminder error', { error: error.message });
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// RUT operations
router.post('/:id/rut', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const invResult = await query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (action === 'apply') {
      await query("UPDATE invoices SET rut_status = 'applied' WHERE id = $1", [id]);
      res.json({ message: 'RUT application submitted' });
    } else if (action === 'close') {
      await query("UPDATE invoices SET rut_status = 'closed' WHERE id = $1", [id]);
      res.json({ message: 'RUT closed' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    logger.error('RUT error', { error: error.message });
    res.status(500).json({ error: 'Failed to process RUT' });
  }
});

module.exports = router;
