const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all workers
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT w.*, u.name, u.email, u.phone, u.active
       FROM workers w
       JOIN users u ON u.id = w.user_id
       ORDER BY u.name`
    );

    res.json({ workers: result.rows });
  } catch (error) {
    logger.error('Get workers error', { error: error.message });
    res.status(500).json({ error: 'Failed to get workers' });
  }
});

// Create worker
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, phone, skills, availability } = req.body;
    
    // Create user first
    const salt = await require('bcryptjs').genSalt(12);
    const passwordHash = await require('bcryptjs').hash(Math.random().toString(36), salt);
    
    const userResult = await query(
      `INSERT INTO users (email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, 'worker')
       RETURNING id`,
      [email, passwordHash, name, phone]
    );

    const userId = userResult.rows[0].id;

    // Create worker record
    const workerResult = await query(
      `INSERT INTO workers (user_id, skills, availability)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, skills || [], availability || {}]
    );

    res.status(201).json({
      message: 'Worker created',
      worker: { ...workerResult.rows[0], name, email, phone }
    });
  } catch (error) {
    logger.error('Create worker error', { error: error.message });
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// Get worker's assigned bookings
router.get('/:id/bookings', authenticate, authorize('admin', 'worker'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // If worker role, only show their own bookings
    if (req.user.role === 'worker') {
      const workerCheck = await query(
        'SELECT id FROM workers WHERE user_id = $1',
        [req.user.id]
      );
      if (workerCheck.rows.length === 0 || workerCheck.rows[0].id !== parseInt(id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await query(
      `SELECT b.*, u.name as customer_name, u.phone as customer_phone
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.worker_id = $1 AND b.status NOT IN ('completed', 'cancelled')
       ORDER BY b.booking_date, b.time_slot`,
      [id]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    logger.error('Get worker bookings error', { error: error.message });
    res.status(500).json({ error: 'Failed to get worker bookings' });
  }
});

module.exports = router;
