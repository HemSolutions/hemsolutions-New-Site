const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
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

// Get all reminders
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, i.invoice_number, i.customer_id, c.name as customer_name, c.email as customer_email
       FROM reminders r
       JOIN invoices i ON i.id = r.invoice_id
       JOIN users c ON c.id = i.customer_id
       ORDER BY r.created_at DESC`
    );
    res.json({ reminders: result.rows });
  } catch (error) {
    logger.error('Get reminders error', { error: error.message });
    res.status(500).json({ error: 'Failed to get reminders' });
  }
});

// Create reminder
router.post('/', [
  body('invoice_id').isInt(),
  body('type').optional().trim(),
  body('message').optional().trim(),
  validate
], authenticate, authorize('admin'), async (req, res) => {
  try {
    const { invoice_id, type = 'email', message } = req.body;
    
    const result = await query(
      `INSERT INTO reminders (invoice_id, type, message, status, sent_at)
       VALUES ($1, $2, $3, 'pending', NOW())
       RETURNING *`,
      [invoice_id, type, message]
    );
    
    res.status(201).json({ 
      success: true, 
      reminder: result.rows[0],
      message: 'Reminder created successfully'
    });
  } catch (error) {
    logger.error('Create reminder error', { error: error.message });
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update reminder status
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query(
      `UPDATE reminders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json({ reminder: result.rows[0] });
  } catch (error) {
    logger.error('Update reminder error', { error: error.message });
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM reminders WHERE id = $1', [id]);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    logger.error('Delete reminder error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

module.exports = router;
