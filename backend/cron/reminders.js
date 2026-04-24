const cron = require('node-cron');
const { query } = require('../config/database');
const notificationService = require('../services/notifications');
const logger = require('../utils/logger');

// Send reminders 24 hours before booking
const dailyReminder = cron.schedule('0 9 * * *', async () => {
  logger.info('Running daily reminder job');
  
  try {
    // Get bookings for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const bookings = await query(
      `SELECT b.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.booking_date = $1 
       AND b.status IN ('pending', 'confirmed')
       AND NOT EXISTS (
         SELECT 1 FROM notifications n 
         WHERE n.booking_id = b.id 
         AND n.type = 'bookingReminder'
         AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
       )`,
      [dateStr]
    );

    for (const booking of bookings.rows) {
      try {
        await notificationService.sendBookingReminder(booking, {
          id: booking.customer_id,
          name: booking.customer_name,
          email: booking.customer_email,
          phone: booking.customer_phone
        });
        logger.info(`Reminder sent for booking ${booking.id}`);
      } catch (error) {
        logger.error(`Failed to send reminder for booking ${booking.id}`, { error: error.message });
      }
    }

    logger.info(`Daily reminders: ${bookings.rows.length} sent`);
  } catch (error) {
    logger.error('Daily reminder job failed', { error: error.message });
  }
}, {
  scheduled: true,
  timezone: 'Europe/Stockholm'
});

// Send reminders 1 hour before booking
const hourlyReminder = cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const timeStr = `${String(oneHourFromNow.getHours()).padStart(2, '0')}:00`;
    const dateStr = oneHourFromNow.toISOString().split('T')[0];

    const bookings = await query(
      `SELECT b.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.booking_date = $1 
       AND b.time_slot = $2
       AND b.status = 'confirmed'
       AND NOT EXISTS (
         SELECT 1 FROM notifications n 
         WHERE n.booking_id = b.id 
         AND n.type = 'bookingReminder'
         AND n.recipient_type = 'sms'
         AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
       )`,
      [dateStr, timeStr]
    );

    for (const booking of bookings.rows) {
      try {
        // Only SMS for 1-hour reminder
        await notificationService.sendNotification({
          userId: booking.customer_id,
          bookingId: booking.id,
          type: 'bookingReminder',
          phone: booking.customer_phone,
          smsData: {
            serviceType: booking.service_type,
            date: booking.booking_date,
            time: booking.time_slot,
            address: booking.address
          }
        });
        logger.info(`1-hour SMS reminder sent for booking ${booking.id}`);
      } catch (error) {
        logger.error(`Failed to send 1-hour reminder for booking ${booking.id}`, { error: error.message });
      }
    }
  } catch (error) {
    logger.error('Hourly reminder job failed', { error: error.message });
  }
}, {
  scheduled: true,
  timezone: 'Europe/Stockholm'
});

module.exports = { dailyReminder, hourlyReminder };
