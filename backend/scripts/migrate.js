const { query, transaction, getSQLiteDb } = require('../config/database');
const logger = require('../utils/logger');

// Check if using SQLite
const useSQLite = !process.env.DATABASE_URL || process.env.USE_SQLITE === 'true';

// Database migration script
const migrations = [
  {
    id: '001_initial_schema',
    sql: `
      -- Users table (customers, workers, admins)
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        postcode VARCHAR(20),
        city VARCHAR(100),
        role VARCHAR(50) DEFAULT 'customer',
        personnummer VARCHAR(20),
        bankid_verified INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Customers table (extended profile)
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        preferred_contact VARCHAR(50) DEFAULT 'email',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Workers table
      CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        skills TEXT,
        rating DECIMAL(2,1) DEFAULT 5.0,
        availability TEXT,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Services table
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2),
        price_per_hour DECIMAL(10,2),
        estimated_hours INTEGER DEFAULT 2,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Bookings table
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      );

      -- Invoices table
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL REFERENCES bookings(id),
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
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(50) NOT NULL,
        recipient_type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        content TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP,
        error_message TEXT,
        booking_id INTEGER REFERENCES bookings(id),
        invoice_id INTEGER REFERENCES invoices(id),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Settings table
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Payment transactions
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER REFERENCES invoices(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        provider_transaction_id VARCHAR(255),
        provider VARCHAR(50),
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    id: '002_add_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings(worker_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
      CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_booking ON notifications(booking_id);
    `
  }
];

async function runMigrations() {
  logger.info('Starting database migrations...');

  try {
    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const migration of migrations) {
      // Check if migration already ran
      const result = await query(
        'SELECT id FROM migrations WHERE id = $1',
        [migration.id]
      );

      if (result.rows.length === 0) {
        logger.info(`Running migration: ${migration.id}`);
        
        if (useSQLite) {
          // For SQLite, use db.exec() which supports multiple statements
          const db = getSQLiteDb();
          await new Promise((resolve, reject) => {
            db.exec(migration.sql, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          await query('INSERT INTO migrations (id) VALUES ($1)', [migration.id]);
        } else {
          // For PostgreSQL, use transaction
          await transaction(async (client) => {
            await client.query(migration.sql);
            await client.query('INSERT INTO migrations (id) VALUES ($1)', [migration.id]);
          });
        }
        
        logger.info(`Migration ${migration.id} completed successfully`);
      } else {
        logger.info(`Migration ${migration.id} already executed, skipping`);
      }
    }

    logger.info('All migrations completed successfully');
    return true;
  } catch (error) {
    logger.error('Migration failed', { error: error.message });
    throw error;
  }
}

module.exports = { runMigrations };
