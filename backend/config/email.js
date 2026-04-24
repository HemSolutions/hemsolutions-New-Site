const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.one.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
async function verifyConnection() {
  try {
    await transporter.verify();
    logger.info('Email service connected successfully');
    return true;
  } catch (error) {
    logger.error('Email service connection failed', { error: error.message });
    return false;
  }
}

// Send email
async function sendEmail({ to, subject, html, text, from, attachments }) {
  try {
    const info = await transporter.sendMail({
      from: from || `"${process.env.EMAIL_FROM_NAME || 'HemSolutions'}" <${process.env.EMAIL_FROM || 'info@hemsolutions.se'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      attachments
    });

    logger.info('Email sent successfully', { 
      messageId: info.messageId,
      to,
      subject 
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error('Failed to send email', { 
      error: error.message,
      to,
      subject 
    });
    throw error;
  }
}

// Email templates
const templates = {
  bookingConfirmation: (data) => ({
    subject: `Bokningsbekräftelse - HemSolutions #${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Tack för din bokning!</h2>
        <p>Hej ${data.customerName},</p>
        <p>Din städning är nu bokad. Här är dina bokningsdetaljer:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Bokningsnr:</strong> #${data.bookingId}</p>
          <p><strong>Tjänst:</strong> ${data.serviceType}</p>
          <p><strong>Datum:</strong> ${data.date}</p>
          <p><strong>Tid:</strong> ${data.time}</p>
          <p><strong>Adress:</strong> ${data.address}</p>
          <p><strong>Timmar:</strong> ${data.hours}</p>
        </div>
        <p>Vi kommer att skicka påminnelser närmare bokningsdatumet.</p>
        <p>Har du frågor? Kontakta oss på <a href="mailto:info@hemsolutions.se">info@hemsolutions.se</a></p>
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          HemSolutions Sverige AB<br>
          www.hemsolutions.se<br>
          info@hemsolutions.se
        </p>
      </div>
    `
  }),

  bookingReminder: (data) => ({
    subject: `Påminnelse: Städning imorgon - HemSolutions #${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Påminnelse om din städning</h2>
        <p>Hej ${data.customerName},</p>
        <p>Vi vill påminna dig om din bokade städning imorgon:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Datum:</strong> ${data.date}</p>
          <p><strong>Tid:</strong> ${data.time}</p>
          <p><strong>Adress:</strong> ${data.address}</p>
          <p><strong>Tjänst:</strong> ${data.serviceType}</p>
        </div>
        <p>Vår städare kommer att vara på plats enligt överenskommen tid.</p>
        <p>Har du frågor eller behöver ändra något? Kontakta oss omgående på 08-525 133 39.</p>
      </div>
    `
  }),

  bookingUpdate: (data) => ({
    subject: `Bokningsändring - HemSolutions #${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Din bokning har uppdaterats</h2>
        <p>Hej ${data.customerName},</p>
        <p>Din bokning #${data.bookingId} har uppdaterats med följande ändringar:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${data.changes.map(change => `<p><strong>${change.field}:</strong> ${change.old} → ${change.new}</p>`).join('')}
        </div>
        <p>Om detta var felaktigt, kontakta oss omedelbart.</p>
      </div>
    `
  }),

  invoice: (data) => ({
    subject: `Faktura från HemSolutions #${data.invoiceId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Faktura</h2>
        <p>Hej ${data.customerName},</p>
        <p>Här är din faktura för städtjänsten:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Fakturanr:</strong> #${data.invoiceId}</p>
          <p><strong>Belopp:</strong> ${data.amount} kr</p>
          <p><strong>Förfallodatum:</strong> ${data.dueDate}</p>
          <p><strong>Betalningsmetoder:</strong> Kort, Swish, Banköverföring</p>
        </div>
        <p>Betala enkelt via vår hemsida eller Swisha till ${data.swishNumber || '123 123 12 34'}.</p>
      </div>
    `
  }),

  welcome: (data) => ({
    subject: 'Välkommen till HemSolutions!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Välkommen!</h2>
        <p>Hej ${data.name},</p>
        <p>Tack för att du registrerade dig hos HemSolutions. Vi är glada att ha dig som kund.</p>
        <p>Med ditt konto kan du:</p>
        <ul>
          <li>Boka städning online</li>
          <li>Se dina tidigare och kommande bokningar</li>
          <li>Hantera dina fakturor</li>
          <li>Uppdatera dina uppgifter</li>
        </ul>
        <a href="https://www.hemsolutions.se/login" style="display: inline-block; background: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Logga in här</a>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  verifyConnection,
  templates
};
