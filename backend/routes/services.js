const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all services
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
});

// Create service (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, base_price, price_per_hour, estimated_hours } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const result = await query(
      `INSERT INTO services (name, description, base_price, price_per_hour, estimated_hours)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || '', base_price || 0, price_per_hour || 0, estimated_hours || 2]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Create service error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

// Update service (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, base_price, price_per_hour, estimated_hours, active } = req.body;
    const result = await query(
      `UPDATE services SET name = $1, description = $2, base_price = $3, price_per_hour = $4, estimated_hours = $5, active = COALESCE($6, active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, description, base_price, price_per_hour, estimated_hours, active, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Update service error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

// Delete service (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await query('DELETE FROM services WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    logger.error('Delete service error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

module.exports = router;
