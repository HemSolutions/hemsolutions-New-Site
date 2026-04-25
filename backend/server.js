const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database
const { testConnection } = require('./config/database');

// Import services
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const workerRoutes = require('./routes/workers');
const invoiceRoutes = require('./routes/invoices');
const settingsRoutes = require('./routes/settings');
const paymentRoutes = require('./routes/payments');
const customerRoutes = require('./routes/customers');
const contactRoutes = require('./routes/contact');
const serviceRoutes = require('./routes/services');
const reminderRoutes = require('./routes/reminders');

// Import cron jobs
require('./cron/reminders');
require('./cron/bookingSync');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Please slow down and try again later'
  }
});
app.use('/api/', limiter);

// CORS - allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:4173',
  'https://hemsolutions.se',
  'https://www.hemsolutions.se'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // Allow all origins in production for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'PostgreSQL connected' : 'Database error',
      version: '2.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      database: 'Connection failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reminders', reminderRoutes);

// Root API info
app.get('/api', (req, res) => {
  res.json({
    name: 'HemSolutions API',
    version: '2.0.0',
    status: 'Running',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/bookings',
      '/api/services',
      '/api/admin',
      '/api/workers',
      '/api/invoices',
      '/api/settings',
      '/api/payments',
      '/api/customers',
      '/api/contact'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDev ? err.message : 'Something went wrong. Please try again.',
    ...(isDev && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Server will start but functionality may be limited.');
    } else {
      logger.info('Database connected successfully');
    }

    app.listen(PORT, () => {
      logger.info('========================================');
      logger.info('🚀 HemSolutions API Server v2.0.0');
      logger.info(`📡 Running on port ${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:4173'}`);
      logger.info(`📧 Email: ${process.env.EMAIL_FROM || 'Not configured'}`);
      logger.info(`📱 SMS: ${process.env.SMS_PROVIDER || 'Not configured'}`);
      logger.info('========================================');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
