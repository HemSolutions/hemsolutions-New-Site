const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { generateToken, authenticate } = require('../middleware/auth');
const notificationService = require('../services/notifications');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
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

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  validate
], async (req, res) => {
  try {
    const { email, password, name, phone, address, postcode, city } = req.body;

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, address, postcode, city, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'customer')
       RETURNING id, email, name, phone, role`,
      [email, passwordHash, name, phone, address, postcode, city]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    // Create customer record
    await query('INSERT INTO customers (user_id) VALUES ($1)', [user.id]);

    // Send welcome notification
    try {
      await notificationService.sendNotification({
        userId: user.id,
        type: 'welcome',
        email: user.email,
        phone: user.phone,
        emailData: { name: user.name },
        smsData: { name: user.name }
      });
    } catch (error) {
      logger.error('Welcome notification failed', { error: error.message });
    }

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, name, password_hash, role, phone, address, active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.phone, u.address, u.postcode, u.city, u.role, 
              u.bankid_verified, u.created_at,
              c.preferred_contact, c.notes
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    logger.error('Get user error', { error: error.message });
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { name, phone, address, postcode, city } = req.body;
    
    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           postcode = COALESCE($4, postcode),
           city = COALESCE($5, city)
       WHERE id = $6
       RETURNING id, email, name, phone, address, postcode, city, role`,
      [name, phone, address, postcode, city, req.user.id]
    );

    res.json({
      message: 'Profile updated',
      user: result.rows[0]
    });
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
