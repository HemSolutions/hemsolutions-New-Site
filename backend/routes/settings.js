const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all settings
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings ORDER BY key');
    res.json({ settings: result.rows });
  } catch (error) {
    logger.error('Get settings error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to get settings', message: error.message });
  }
});

// Get single setting
router.get('/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query('SELECT * FROM settings WHERE key = $1', [key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ setting: result.rows[0] });
  } catch (error) {
    logger.error('Get setting error', { error: error.message });
    res.status(500).json({ error: 'Failed to get setting' });
  }
});

// Create or update setting
router.put('/:key', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const result = await query(
      `INSERT INTO settings (key, value, description, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = $2, description = COALESCE($3, settings.description), updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, value, description]
    );

    res.json({ setting: result.rows[0] });
  } catch (error) {
    logger.error('Update setting error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update setting', message: error.message });
  }
});

module.exports = router;
