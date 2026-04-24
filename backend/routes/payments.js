const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all payment transactions
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await query(
      `SELECT pt.*, i.invoice_number, u.name as customer_name
       FROM payment_transactions pt
       LEFT JOIN invoices i ON i.id = pt.invoice_id
       LEFT JOIN users u ON u.id = i.customer_id
       ORDER BY pt.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ payments: result.rows });
  } catch (error) {
    logger.error('Get payments error', { error: error.message });
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

module.exports = router;
