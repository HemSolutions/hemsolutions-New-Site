const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

// Import database
const { testConnection, query } = require('./config/database');

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
    body: req.body,
    query: req.query
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
      database: dbConnected ? 'PostgreSQL connected' : 'Connection failed',
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

// Database initialization
async function initDatabase() {
  try {
    logger.info('Initializing database...');
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        postcode VARCHAR(20),
        city VARCHAR(100),
        role VARCHAR(50) DEFAULT 'customer',
        personnummer VARCHAR(20),
        bankid_verified BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create workers table
    await query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        skills TEXT,
        rating DECIMAL(2,1) DEFAULT 5.0,
        availability TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create services table
    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2),
        price_per_hour DECIMAL(10,2),
        estimated_hours INTEGER DEFAULT 2,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create bookings table
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES users(id),
        worker_id INTEGER REFERENCES workers(id),
        service_id INTEGER REFERENCES services(id),
        service_type VARCHAR(255) NOT NULL,
        booking_date DATE NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        hours INTEGER DEFAULT 2,
        address TEXT,
        postcode VARCHAR(20),
        city VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        total_price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create invoices table
    await query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id),
        customer_id INTEGER REFERENCES users(id),
        invoice_number VARCHAR(100) UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        stripe_payment_intent_id VARCHAR(255),
        swish_payment_reference VARCHAR(255),
        sent_at TIMESTAMP,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create payments table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'completed',
        stripe_charge_id VARCHAR(255),
        swish_payment_reference VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create reminders table
    await query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id),
        type VARCHAR(50) NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        email_sent BOOLEAN DEFAULT FALSE,
        sms_sent BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create settings table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        type VARCHAR(50) DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Seed admin user if not exists
    const adminResult = await query(
      'SELECT * FROM users WHERE email = $1',
      ['info@hemsolutions.se']
    );
    
    if (adminResult.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Mzeeshan786', 10);
      await query(`
        INSERT INTO users (email, password_hash, name, role, active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['info@hemsolutions.se', hashedPassword, 'HemSolutions Admin', 'admin', true]);
      logger.info('Admin user created');
    }
    
    // Seed employee user if not exists
    const employeeResult = await query(
      'SELECT * FROM users WHERE email = $1',
      ['employee@hemsolutions.se']
    );
    
    if (employeeResult.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('employee123', 10);
      await query(`
        INSERT INTO users (email, password_hash, name, role, active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['employee@hemsolutions.se', hashedPassword, 'Employee Demo', 'worker', true]);
      logger.info('Employee user created');
    }
    
    // Seed customer user if not exists
    const customerResult = await query(
      'SELECT * FROM users WHERE email = $1',
      ['customer@demo.se']
    );
    
    if (customerResult.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('customer123', 10);
      await query(`
        INSERT INTO users (email, password_hash, name, role, active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['customer@demo.se', hashedPassword, 'Customer Demo', 'customer', true]);
      logger.info('Customer user created');
    }
    
    // Seed services if not exists
    const servicesResult = await query('SELECT * FROM services LIMIT 1');
    if (servicesResult.rows.length === 0) {
      const services = [
        ['Städning', 'Professionell städning för hem och kontor', 450, 350, 3],
        ['Trädgårdsskötsel', 'Gräsklippning, häckklippning och trädgårdsunderhåll', 500, 400, 2],
        ['Fönsterputs', 'Fönsterputsning in och utvändigt', 350, 300, 2],
        ['Flyttstädning', 'Komplett städning vid flytt', 800, 450, 4],
        ['Byggstädning', 'Städning efter byggarbeten', 600, 400, 3]
      ];
      
      for (const service of services) {
        await query(`
          INSERT INTO services (name, description, base_price, price_per_hour, estimated_hours)
          VALUES ($1, $2, $3, $4, $5)
        `, service);
      }
      logger.info('Services seeded');
    }
    
    logger.info('Database initialization complete');
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message, stack: error.stack });
    throw error;
  }
}

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Server will start but functionality may be limited.');
    } else {
      logger.info('Database connected successfully');
      
      // Initialize database tables
      try {
        await initDatabase();
      } catch (initError) {
        logger.error('Failed to initialize database tables', { error: initError.message });
      }
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
