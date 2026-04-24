const axios = require('axios');
const logger = require('../utils/logger');

const ELKS_API_URL = 'https://api.46elks.com/a1';

// Get auth credentials
function getAuth() {
  return {
    username: process.env.ELKS_API_USERNAME,
    password: process.env.ELKS_API_PASSWORD
  };
}

// Send SMS
async function sendSMS({ to, message, from }) {
  try {
    const auth = getAuth();
    if (!auth.username || !auth.password) {
      throw new Error('46elks credentials not configured');
    }

    // Format phone number (Swedish format)
    let formattedTo = to.replace(/\s/g, '');
    if (formattedTo.startsWith('0')) {
      formattedTo = '+46' + formattedTo.substring(1);
    }
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+' + formattedTo;
    }

    const response = await axios.post(
      `${ELKS_API_URL}/sms`,
      new URLSearchParams({
        from: from || process.env.SMS_FROM || 'HemSolutions',
        to: formattedTo,
        message: message
      }),
      {
        auth,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    logger.info('SMS sent successfully', {
      to: formattedTo,
      id: response.data.id,
      status: response.data.status
    });

    return {
      success: true,
      id: response.data.id,
      status: response.data.status
    };
  } catch (error) {
    logger.error('Failed to send SMS', {
      error: error.response?.data || error.message,
      to
    });
    throw error;
  }
}

// Get account balance/info
async function getAccountInfo() {
  try {
    const auth = getAuth();
    const response = await axios.get(`${ELKS_API_URL}/me`, { auth });
    return response.data;
  } catch (error) {
    logger.error('Failed to get 46elks account info', { error: error.message });
    throw error;
  }
}

// SMS templates (Swedish)
const templates = {
  bookingConfirmation: (data) => ({
    message: `Tack for din bokning! #${data.bookingId}\n${data.serviceType} ${data.date} kl ${data.time}\n${data.address}\nHar du fragor? Ring 08-525 133 39`
  }),

  bookingReminder: (data) => ({
    message: `Paminelse: Stadning imorgon!\n${data.serviceType}\n${data.date} kl ${data.time}\n${data.address}\n/HemSolutions`
  }),

  bookingUpdate: (data) => ({
    message: `Din bokning #${data.bookingId} har uppdaterats.\nNy tid: ${data.date} ${data.time}\nVid fragor: 08-525 133 39`
  }),

  workerAssigned: (data) => ({
    message: `Ny bokning tilldelad!\n#${data.bookingId}\n${data.serviceType}\n${data.date} ${data.time}\n${data.address}\nKund: ${data.customerPhone}`
  }),

  paymentReceived: (data) => ({
    message: `Betalning mottagen!\nFaktura #${data.invoiceId}\n${data.amount} kr\nTack for att du valde HemSolutions!`
  }),

  welcome: (data) => ({
    message: `Valkommen till HemSolutions!\nDitt konto ar nu aktivt.\nBoka stadning: www.hemsolutions.se\nVid fragor: info@hemsolutions.se`
  })
};

module.exports = {
  sendSMS,
  getAccountInfo,
  templates
};
