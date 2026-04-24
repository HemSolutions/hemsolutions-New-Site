const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT key, value, description FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json({ settings });
  } catch (error) {
    logger.error('Get settings error', { error: error.message });
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update setting (admin only)
router.put('/:key', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    await query(
      `INSERT INTO settings (key, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, description = COALESCE($3, settings.description), updated_at = CURRENT_TIMESTAMP`,
      [key, value, description]
    );

    res.json({ message: 'Setting updated', key, value });
  } catch (error) {
    logger.error('Update setting error', { error: error.message });
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;
