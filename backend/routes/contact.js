const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../config/email');
const logger = require('../utils/logger');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// Contact form submission
router.post('/', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('subject').trim().isLength({ min: 2 }),
  body('message').trim().isLength({ min: 10 }),
  validate
], async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Send to HemSolutions
    await emailService.sendEmail({
      to: process.env.EMAIL_FROM || 'info@hemsolutions.se',
      subject: `Kontaktformulär: ${subject}`,
      html: `
        <h2>Nytt meddelande från kontaktformuläret</h2>
        <p><strong>Namn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone || 'Ej angivet'}</p>
        <p><strong>Ämne:</strong> ${subject}</p>
        <p><strong>Meddelande:</strong></p>
        <blockquote style="background: #f3f4f6; padding: 15px; border-left: 4px solid #1a56db;">
          ${message.replace(/\n/g, '<br>')}
        </blockquote>
      `
    });

    // Send confirmation to customer
    await emailService.sendEmail({
      to: email,
      subject: 'Vi har mottagit ditt meddelande - HemSolutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a56db;">Tack för ditt meddelande!</h2>
          <p>Hej ${name},</p>
          <p>Vi har mottagit ditt meddelande och återkommer så snart vi kan.</p>
          <p><strong>Ditt ämne:</strong> ${subject}</p>
          <p>Vid brådskande ärenden, ring oss på 08-525 133 39.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
            HemSolutions Sverige AB<br>
            www.hemsolutions.se
          </p>
        </div>
      `
    });

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    logger.error('Contact form error', { error: error.message });
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
