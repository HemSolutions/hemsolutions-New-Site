const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const logger = require('../utils/logger');

async function seed() {
  logger.info('Starting database seed...');

  try {
    // Insert default services
    const services = [
      {
        name: 'Hemstädning',
        description: 'Regelbunden städning av ditt hem. Dammsugning, moppning, badrumstädning och mer.',
        base_price: 0,
        price_per_hour: 350,
        estimated_hours: 3
      },
      {
        name: 'Flyttstädning',
        description: 'Grundlig städning vid flytt. Inklusive fönsterputs och djuprengöring.',
        base_price: 2500,
        price_per_hour: 350,
        estimated_hours: 6
      },
      {
        name: 'Storstädning',
        description: 'Djupgående städning för hela hemmet. Perfekt vid säsongsbyten eller inför speciella tillfällen.',
        base_price: 1500,
        price_per_hour: 350,
        estimated_hours: 5
      },
      {
        name: 'Fönsterputs',
        description: 'Professionell fönsterputs för skinande rena fönster in- och utvändigt.',
        base_price: 500,
        price_per_hour: 400,
        estimated_hours: 2
      },
      {
        name: 'Kontorsstädning',
        description: 'Städtjänster för företag. Anpassad efter era behov och schema.',
        base_price: 0,
        price_per_hour: 300,
        estimated_hours: 4
      }
    ];

    for (const service of services) {
      const existing = await query(
        'SELECT id FROM services WHERE name = $1',
        [service.name]
      );
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO services (name, description, base_price, price_per_hour, estimated_hours)
           VALUES ($1, $2, $3, $4, $5)`,
          [service.name, service.description, service.base_price, service.price_per_hour, service.estimated_hours]
        );
      }
    }
    logger.info('Services seeded');

    // Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'info@hemsolutions.se';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      await query(
        `INSERT INTO users (email, password_hash, name, phone, role)
         VALUES ($1, $2, $3, $4, 'admin')`,
        [adminEmail, passwordHash, 'HemSolutions Admin', '08-525 133 39']
      );
      logger.info('Admin user created');
    } else {
      logger.info('Admin user already exists');
    }

    // Create dummy employee/worker user
    const dummyEmployeeEmail = 'employee@hemsolutions.se';
    const dummyEmployeePassword = 'employee123';

    const existingEmployee = await query(
      'SELECT id FROM users WHERE email = $1',
      [dummyEmployeeEmail]
    );

    if (existingEmployee.rows.length === 0) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(dummyEmployeePassword, salt);

      await query(
        `INSERT INTO users (email, password_hash, name, phone, address, postcode, city, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'worker')`,
        [dummyEmployeeEmail, passwordHash, 'Anna Städare', '070-123 45 67', 'Storgatan 1', '11122', 'Stockholm']
      );
      logger.info('Dummy employee user created');
    } else {
      logger.info('Dummy employee user already exists');
    }

    // Create dummy customer user
    const dummyCustomerEmail = 'customer@demo.se';
    const dummyCustomerPassword = 'customer123';

    const existingCustomer = await query(
      'SELECT id FROM users WHERE email = $1',
      [dummyCustomerEmail]
    );

    if (existingCustomer.rows.length === 0) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(dummyCustomerPassword, salt);

      await query(
        `INSERT INTO users (email, password_hash, name, phone, address, postcode, city, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'customer')`,
        [dummyCustomerEmail, passwordHash, 'Erik Demo', '070-987 65 43', 'Lillgatan 5', '11133', 'Stockholm']
      );
      logger.info('Dummy customer user created');
    } else {
      logger.info('Dummy customer user already exists');
    }

    // Insert default settings
    const settings = [
      { key: 'company_name', value: 'HemSolutions Sverige AB', description: 'Company name' },
      { key: 'company_email', value: 'info@hemsolutions.se', description: 'Primary email' },
      { key: 'company_phone', value: '08-525 133 39', description: 'Primary phone' },
      { key: 'company_address', value: 'Stockholm, Sverige', description: 'Company address' },
      { key: 'default_currency', value: 'SEK', description: 'Currency' },
      { key: 'vat_rate', value: '25', description: 'VAT percentage' },
      { key: 'booking_confirmation_email', value: 'true', description: 'Send email on booking' },
      { key: 'booking_confirmation_sms', value: 'true', description: 'Send SMS on booking' },
      { key: 'reminder_email', value: 'true', description: 'Send email reminders' },
      { key: 'reminder_sms', value: 'true', description: 'Send SMS reminders' },
      { key: 'payment_methods', value: 'card,swish,bank_transfer', description: 'Available payment methods' }
    ];

    for (const setting of settings) {
      const existing = await query(
        'SELECT id FROM settings WHERE key = $1',
        [setting.key]
      );
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO settings (key, value, description)
           VALUES ($1, $2, $3)`,
          [setting.key, setting.value, setting.description]
        );
      }
    }
    logger.info('Settings seeded');

    logger.info('Database seed completed successfully');
  } catch (error) {
    logger.error('Seed failed', { error: error.message });
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seed };
