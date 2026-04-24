const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const notificationService = require('../services/notifications');
const logger = require('../utils/logger');

const router = express.Router();

// Create payment intent (Stripe)
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const { invoice_id } = req.body;
    
    // Get invoice
    const invoiceResult = await query(
      `SELECT i.*, b.customer_id, u.email as customer_email, u.name as customer_name
       FROM invoices i
       JOIN bookings b ON b.id = i.booking_id
       JOIN users u ON u.id = b.customer_id
       WHERE i.id = $1`,
      [invoice_id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Check authorization
    if (req.user.role === 'customer' && invoice.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total_amount * 100), // Convert to ören
      currency: 'sek',
      automatic_payment_methods: { enabled: true },
      metadata: {
        invoice_id: invoice.id,
        booking_id: invoice.booking_id,
        customer_id: invoice.customer_id
      }
    });

    // Record transaction
    await query(
      `INSERT INTO payment_transactions (invoice_id, amount, payment_method, provider, provider_transaction_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [invoice_id, invoice.total_amount, 'card', 'stripe', paymentIntent.id]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    logger.error('Create payment intent error', { error: error.message });
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Webhook for Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const invoiceId = paymentIntent.metadata.invoice_id;

    try {
      // Update invoice status
      await query(
        "UPDATE invoices SET status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = 'card', stripe_payment_intent_id = $1 WHERE id = $2",
        [paymentIntent.id, invoiceId]
      );

      // Update payment transaction
      await query(
        "UPDATE payment_transactions SET status = 'completed' WHERE provider_transaction_id = $1",
        [paymentIntent.id]
      );

      // Get customer for notification
      const customerResult = await query(
        `SELECT u.id, u.name, u.email, u.phone
         FROM invoices i
         JOIN bookings b ON b.id = i.booking_id
         JOIN users u ON u.id = b.customer_id
         WHERE i.id = $1`,
        [invoiceId]
      );

      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        await notificationService.sendPaymentConfirmation(
          { id: invoiceId, total_amount: paymentIntent.amount / 100 },
          customer
        );
      }

      logger.info('Payment succeeded', { invoiceId, paymentIntentId: paymentIntent.id });
    } catch (error) {
      logger.error('Payment success handling error', { error: error.message });
    }
  }

  res.json({ received: true });
});

// Swish payment request (ready for integration)
router.post('/swish', authenticate, async (req, res) => {
  try {
    const { invoice_id, phone } = req.body;
    
    // Swish integration would go here
    // This is a placeholder for Swish implementation
    
    res.json({
      message: 'Swish payment initiated',
      status: 'pending',
      note: 'Swish integration requires MSS (Swish Merchant Swish Simulator) setup'
    });
  } catch (error) {
    logger.error('Swish payment error', { error: error.message });
    res.status(500).json({ error: 'Swish payment failed' });
  }
});

module.exports = router;
