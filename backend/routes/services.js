const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

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

module.exports = router;
