const cron = require('node-cron');
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Auto-cancel old pending bookings (older than 30 days)
const cleanupJob = cron.schedule('0 2 * * *', async () => {
  logger.info('Running booking cleanup job');
  
  try {
    const result = await query(
      `UPDATE bookings 
       SET status = 'cancelled' 
       WHERE status = 'pending' 
       AND booking_date < CURRENT_DATE - INTERVAL '30 days'
       RETURNING id`
    );

    logger.info(`Cleaned up ${result.rows.length} old pending bookings`);
  } catch (error) {
    logger.error('Booking cleanup job failed', { error: error.message });
  }
}, {
  scheduled: true,
  timezone: 'Europe/Stockholm'
});

// Mark bookings as completed after date passes
const completionJob = cron.schedule('30 23 * * *', async () => {
  logger.info('Running booking completion job');
  
  try {
    const result = await query(
      `UPDATE bookings 
       SET status = 'completed'
       WHERE status = 'confirmed' 
       AND booking_date < CURRENT_DATE
       RETURNING id`
    );

    logger.info(`Auto-completed ${result.rows.length} bookings`);
  } catch (error) {
    logger.error('Booking completion job failed', { error: error.message });
  }
}, {
  scheduled: true,
  timezone: 'Europe/Stockholm'
});

module.exports = { cleanupJob, completionJob };
