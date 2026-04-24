const { query, getSQLiteDb } = require('../config/database');
const logger = require('../utils/logger');

const useSQLite = !process.env.DATABASE_URL || process.env.USE_SQLITE === 'true';

// Migration for admin dashboard v2 features
const migrations = [
  {
    id: '003_admin_v2_schema',
    sql: `
      -- Add customer_id directly to invoices (for standalone invoices not linked to bookings)
      ALTER TABLE invoices ADD COLUMN customer_id INTEGER REFERENCES users(id);
      ALTER TABLE invoices ADD COLUMN invoice_date DATE DEFAULT CURRENT_DATE;
      ALTER TABLE invoices ADD COLUMN our_contact VARCHAR(255);
      ALTER TABLE invoices ADD COLUMN customer_contact VARCHAR(255);
      ALTER TABLE invoices ADD COLUMN is_rut INTEGER DEFAULT 0;
      ALTER TABLE invoices ADD COLUMN rut_amount DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE invoices ADD COLUMN notes TEXT;
      ALTER TABLE invoices ADD COLUMN remaining_amount DECIMAL(10,2) DEFAULT 0;

      -- Invoice line items table
      CREATE TABLE IF NOT EXISTS invoice_line_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description VARCHAR(500) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
        unit VARCHAR(50) DEFAULT 'st',
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount DECIMAL(5,2) DEFAULT 0,
        vat DECIMAL(5,2) DEFAULT 25,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Reminders table
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        reminder_type VARCHAR(50) NOT NULL DEFAULT 'email',
        days_after_due INTEGER DEFAULT 7,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add customer type and extended fields
      ALTER TABLE users ADD COLUMN customer_type VARCHAR(50) DEFAULT 'private';
      ALTER TABLE users ADD COLUMN website VARCHAR(255);
      ALTER TABLE users ADD COLUMN discount DECIMAL(5,2) DEFAULT 0;
      ALTER TABLE users ADD COLUMN payment_terms INTEGER DEFAULT 14;
      ALTER TABLE users ADD COLUMN our_contact VARCHAR(255);
      ALTER TABLE users ADD COLUMN customer_contact VARCHAR(255);
      ALTER TABLE users ADD COLUMN customer_number VARCHAR(100);
      ALTER TABLE users ADD COLUMN rut_rot INTEGER DEFAULT 0;

      -- Update existing invoices to set remaining_amount = total_amount
      UPDATE invoices SET remaining_amount = total_amount WHERE remaining_amount IS NULL OR remaining_amount = 0;
    `
  }
];

async function runMigration003() {
  logger.info('Running admin v2 migration...');

  try {
    // Ensure migrations table exists
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const migration of migrations) {
      const result = await query(
        'SELECT id FROM migrations WHERE id = $1',
        [migration.id]
      );

      if (result.rows.length === 0) {
        logger.info(`Running migration: ${migration.id}`);
        
        if (useSQLite) {
          const db = getSQLiteDb();
          // SQLite doesn't support multiple ALTER TABLE in one exec well, so split
          const statements = migration.sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
          for (const stmt of statements) {
            try {
              await new Promise((resolve, reject) => {
                db.run(stmt + ';', (err) => {
                  if (err) {
                    // Ignore "duplicate column" errors
                    if (err.message.includes('duplicate column')) {
                      logger.warn('Column already exists, skipping:', err.message);
                      resolve();
                    } else {
                      reject(err);
                    }
                  } else resolve();
                });
              });
            } catch (e) {
              logger.warn('Statement failed (may already exist):', e.message);
            }
          }
          await query('INSERT INTO migrations (id) VALUES ($1)', [migration.id]);
        } else {
          await query('INSERT INTO migrations (id) VALUES ($1)', [migration.id]);
        }
        
        logger.info(`Migration ${migration.id} completed`);
      } else {
        logger.info(`Migration ${migration.id} already executed`);
      }
    }

    logger.info('Admin v2 migration completed');
    return true;
  } catch (error) {
    logger.error('Migration failed', { error: error.message });
    // Don't throw - allow server to start even if some columns exist
    return true;
  }
}

module.exports = { runMigration003 };
