const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const router = express.Router();

// Get all customers (admin only)
router.get('/', authenticate, authorize('admin', 'worker'), async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT u.id, u.email, u.name, u.phone, u.address, u.postcode, u.city, 
             u.customer_type, u.created_at, u.active, u.discount, u.payment_terms,
             u.customer_number, u.rut_rot, u.org_number,
             (SELECT COALESCE(SUM(i.total_amount), 0) FROM invoices i WHERE i.customer_id = u.id) as total_sales
      FROM users u
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
    logger.error('Get customers error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to get customers', message: error.message });
  }
});

// Create customer (admin v2)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      postcode,
      city,
      customer_type = 'private',
      rut_rot = false,
      payment_terms = 14,
      discount = 0,
      customer_number,
      our_contact,
      customer_contact,
      website,
      personal_number,
      notes,
      org_number
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Generate password hash (temporary)
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, address, postcode, city, 
         role, customer_type, rut_rot, payment_terms, discount, customer_number, 
         our_contact, customer_contact, website, personnummer, notes, org_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'customer', $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id, name, email, phone, address, postcode, city, customer_type, created_at`,
      [email, passwordHash, name, phone, address, postcode, city, 
       customer_type, rut_rot ? 1 : 0, payment_terms, discount, customer_number,
       our_contact, customer_contact, website, personal_number, notes, org_number]
    );

    const customer = result.rows[0];

    res.status(201).json({
      message: 'Customer created',
      customer,
      tempPassword // Admin should share this with customer
    });
  } catch (error) {
    logger.error('Create customer error', { error: error.message });
    if (error.message.includes('UNIQUE constraint') || error.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get single customer with bookings
router.get('/:id', authenticate, authorize('admin', 'worker'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const customerResult = await query(
      `SELECT u.*
       FROM users u
       WHERE u.id = $1 AND u.role = 'customer'`,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const bookingsResult = await query(
      `SELECT * FROM bookings WHERE customer_id = $1 ORDER BY booking_date DESC`,
      [id]
    );

    const invoicesResult = await query(
      `SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      customer: customerResult.rows[0],
      bookings: bookingsResult.rows,
      invoices: invoicesResult.rows
    });
  } catch (error) {
    logger.error('Get customer error', { error: error.message });
    res.status(500).json({ error: 'Failed to get customer' });
  }
});


// Update customer
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = ['name', 'email', 'phone', 'address', 'postcode', 'city', 
                           'customer_type', 'rut_rot', 'payment_terms', 'discount', 
                           'customer_number', 'our_contact', 'customer_contact', 
                           'website', 'personnummer', 'notes', 'org_number', 'active'];
    
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
      `UPDATE users SET ${setClause.join(', ')} WHERE id = $${++paramCount} AND role = 'customer' RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer: result.rows[0] });
  } catch (error) {
    logger.error('Update customer error', { error: error.message });
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM customers WHERE user_id = $1', [id]);
    const result = await query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id', [id, 'customer']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    logger.error('Delete customer error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;

