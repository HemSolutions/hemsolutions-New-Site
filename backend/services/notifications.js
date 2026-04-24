const { query } = require('../config/database');
const emailService = require('../config/email');
const smsService = require('../config/sms');
const logger = require('../utils/logger');

// Send notification (email + SMS)
async function sendNotification({
  userId,
  bookingId,
  invoiceId,
  type,
  email,
  phone,
  emailData,
  smsData
}) {
  const results = [];

  try {
    // Send email if email provided
    if (email && emailData) {
      const emailTemplate = emailService.templates[type];
      if (emailTemplate) {
        const { subject, html } = emailTemplate(emailData);
        
        // Log notification
        const notificationResult = await query(
          `INSERT INTO notifications (type, recipient_type, recipient, subject, content, booking_id, invoice_id, user_id)
           VALUES ($1, 'email', $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [type, email, subject, html, bookingId, invoiceId, userId]
        );

        const notificationId = notificationResult.rows[0].id;

        try {
          await emailService.sendEmail({ to: email, subject, html });
          
          await query(
            'UPDATE notifications SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['sent', notificationId]
          );
          
          results.push({ channel: 'email', status: 'sent', id: notificationId });
        } catch (error) {
          await query(
            'UPDATE notifications SET status = $1, error_message = $2 WHERE id = $3',
            ['failed', error.message, notificationId]
          );
          
          results.push({ channel: 'email', status: 'failed', error: error.message });
        }
      }
    }

    // Send SMS if phone provided
    if (phone && smsData) {
      const smsTemplate = smsService.templates[type];
      if (smsTemplate) {
        const { message } = smsTemplate(smsData);
        
        // Log notification
        const notificationResult = await query(
          `INSERT INTO notifications (type, recipient_type, recipient, content, booking_id, invoice_id, user_id)
           VALUES ($1, 'sms', $2, $3, $4, $5, $6)
           RETURNING id`,
          [type, phone, message, bookingId, invoiceId, userId]
        );

        const notificationId = notificationResult.rows[0].id;

        try {
          await smsService.sendSMS({ to: phone, message });
          
          await query(
            'UPDATE notifications SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['sent', notificationId]
          );
          
          results.push({ channel: 'sms', status: 'sent', id: notificationId });
        } catch (error) {
          await query(
            'UPDATE notifications SET status = $1, error_message = $2 WHERE id = $3',
            ['failed', error.message, notificationId]
          );
          
          results.push({ channel: 'sms', status: 'failed', error: error.message });
        }
      }
    }

    return results;
  } catch (error) {
    logger.error('Notification service error', { error: error.message });
    throw error;
  }
}

// Send booking confirmation
async function sendBookingConfirmation(booking, customer) {
  return sendNotification({
    userId: customer.id,
    bookingId: booking.id,
    type: 'bookingConfirmation',
    email: customer.email,
    phone: customer.phone,
    emailData: {
      bookingId: booking.id,
      customerName: customer.name,
      serviceType: booking.service_type,
      date: booking.booking_date,
      time: booking.time_slot,
      address: booking.address,
      hours: booking.hours
    },
    smsData: {
      bookingId: booking.id,
      serviceType: booking.service_type,
      date: booking.booking_date,
      time: booking.time_slot,
      address: booking.address
    }
  });
}

// Send booking reminder (24h before)
async function sendBookingReminder(booking, customer) {
  return sendNotification({
    userId: customer.id,
    bookingId: booking.id,
    type: 'bookingReminder',
    email: customer.email,
    phone: customer.phone,
    emailData: {
      bookingId: booking.id,
      customerName: customer.name,
      serviceType: booking.service_type,
      date: booking.booking_date,
      time: booking.time_slot,
      address: booking.address
    },
    smsData: {
      serviceType: booking.service_type,
      date: booking.booking_date,
      time: booking.time_slot,
      address: booking.address
    }
  });
}

// Send booking update notification
async function sendBookingUpdate(booking, customer, changes) {
  return sendNotification({
    userId: customer.id,
    bookingId: booking.id,
    type: 'bookingUpdate',
    email: customer.email,
    phone: customer.phone,
    emailData: {
      bookingId: booking.id,
      customerName: customer.name,
      changes
    },
    smsData: {
      bookingId: booking.id,
      date: booking.booking_date,
      time: booking.time_slot
    }
  });
}

// Send payment confirmation
async function sendPaymentConfirmation(invoice, customer) {
  return sendNotification({
    userId: customer.id,
    invoiceId: invoice.id,
    type: 'paymentReceived',
    email: customer.email,
    phone: customer.phone,
    emailData: {
      invoiceId: invoice.id,
      customerName: customer.name,
      amount: invoice.total_amount
    },
    smsData: {
      invoiceId: invoice.id,
      amount: invoice.total_amount
    }
  });
}

module.exports = {
  sendNotification,
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingUpdate,
  sendPaymentConfirmation
};
