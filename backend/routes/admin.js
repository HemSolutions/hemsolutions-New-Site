const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Dashboard data (for /api/admin/dashboard)
router.get('/dashboard', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Total bookings today
    const todayBookings = await query(
      `SELECT COUNT(*) as count FROM bookings WHERE booking_date = date('now')`
    );

    // Pending bookings
    const pendingBookings = await query(
      `SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'`
    );

    // Total revenue this month
    const monthlyRevenue = await query(
      `SELECT ifnull(SUM(total_amount), 0) as revenue FROM invoices 
       WHERE status = 'paid' AND strftime('%m', paid_at) = strftime('%m', 'now')
       AND strftime('%Y', paid_at) = strftime('%Y', 'now')`
    );

    // Active workers
    const activeWorkers = await query(
      `SELECT COUNT(*) as count FROM workers WHERE active = 1`
    );

    // Total customers
    const totalCustomers = await query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'customer'`
    );

    // Recent bookings
    const recentBookings = await query(
      `SELECT b.*, u.name as customer_name
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       ORDER BY b.created_at DESC
       LIMIT 5`
    );

    res.json({
      stats: {
        todayBookings: parseInt(todayBookings.rows[0].count),
        pendingBookings: parseInt(pendingBookings.rows[0].count),
        monthlyRevenue: parseFloat(monthlyRevenue.rows[0].revenue),
        activeWorkers: parseInt(activeWorkers.rows[0].count),
        totalCustomers: parseInt(totalCustomers.rows[0].count)
      },
      recentBookings: recentBookings.rows,
      upcomingBookings: []
    });
  } catch (error) {
    logger.error('Get dashboard error', { error: error.message });
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

// Dashboard stats (duplicate of /dashboard for compatibility)
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Total bookings today
    const todayBookings = await query(
      `SELECT COUNT(*) FROM bookings WHERE booking_date = CURRENT_DATE`
    );

    // Pending bookings
    const pendingBookings = await query(
      `SELECT COUNT(*) FROM bookings WHERE status = 'pending'`
    );

    // Total revenue this month
    const monthlyRevenue = await query(
      `SELECT COALESCE(SUM(total_amount), 0) FROM invoices 
       WHERE status = 'paid' AND EXTRACT(MONTH FROM paid_at) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM paid_at) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    // Active workers
    const activeWorkers = await query(
      `SELECT COUNT(*) FROM workers WHERE active = true`
    );

    // Total customers
    const totalCustomers = await query(
      `SELECT COUNT(*) FROM users WHERE role = 'customer'`
    );

    // Recent bookings
    const recentBookings = await query(
      `SELECT b.*, u.name as customer_name
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       ORDER BY b.created_at DESC
       LIMIT 5`
    );

    // Upcoming bookings (next 7 days)
    const upcomingBookings = await query(
      `SELECT b.*, u.name as customer_name
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
       AND b.status NOT IN ('completed', 'cancelled')
       ORDER BY b.booking_date, b.time_slot`
    );

    res.json({
      stats: {
        todayBookings: parseInt(todayBookings.rows[0].count),
        pendingBookings: parseInt(pendingBookings.rows[0].count),
        monthlyRevenue: parseFloat(monthlyRevenue.rows[0].coalesce),
        activeWorkers: parseInt(activeWorkers.rows[0].count),
        totalCustomers: parseInt(totalCustomers.rows[0].count)
      },
      recentBookings: recentBookings.rows,
      upcomingBookings: upcomingBookings.rows
    });
  } catch (error) {
    logger.error('Get admin stats error', { error: error.message });
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get all notifications
router.get('/notifications', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let sql = `
      SELECT n.*, u.name as recipient_name
      FROM notifications n
      LEFT JOIN users u ON u.id = n.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      sql += ` AND n.status = $${++paramCount}`;
      params.push(status);
    }

    sql += ` ORDER BY n.created_at DESC LIMIT $${++paramCount}`;
    params.push(limit);

    const result = await query(sql, params);
    res.json({ notifications: result.rows });
  } catch (error) {
    logger.error('Get notifications error', { error: error.message });
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

module.exports = router;
