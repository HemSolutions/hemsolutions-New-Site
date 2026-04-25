const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

// Check if PostgreSQL is configured
const usePostgres = process.env.DATABASE_URL && process.env.USE_SQLITE !== 'true';

let pool;
let sqliteDb;

if (usePostgres) {
  // PostgreSQL configuration
  const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  pool = new Pool(config);

  pool.on('error', (err) => {
    logger.error('Unexpected database pool error', { error: err.message });
  });
}

// SQLite fallback for local demo
function getSQLiteDb() {
  if (!sqliteDb) {
    const dbPath = path.resolve(__dirname, '../data/hemsolutions-demo.db');
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening SQLite database:', err.message);
      } else {
        logger.info('Connected to SQLite database at', dbPath);
      }
    });
    sqliteDb.run('PRAGMA foreign_keys = ON');
  }
  return sqliteDb;
}

// Test connection
async function testConnection() {
  if (usePostgres && pool) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as now');
      client.release();
      logger.info('PostgreSQL connected', { time: result.rows[0].now });
      return true;
    } catch (error) {
      logger.error('PostgreSQL failed, falling back to SQLite', { error: error.message });
    }
  }

  // SQLite always works locally
  try {
    const db = getSQLiteDb();
    await new Promise((resolve, reject) => {
      db.get('SELECT 1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    logger.info('SQLite connected (demo mode)');
    return true;
  } catch (error) {
    logger.error('SQLite connection failed', { error: error.message });
    return false;
  }
}

// Promisified SQLite helpers
function sqliteQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getSQLiteDb();
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ rows, rowCount: rows.length });
    });
  });
}

function sqliteRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getSQLiteDb();
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
    });
  });
}

// Query helper - PostgreSQL style interface
async function query(text, params = []) {
  const start = Date.now();

  if (usePostgres && pool) {
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('PostgreSQL query', { duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.warn('PostgreSQL query failed, trying SQLite', { error: error.message });
    }
  }

  // Convert PostgreSQL syntax to SQLite
  let sqliteText = text;
  
  // Only convert $N placeholders for DML statements
  const isDDL = /^\s*(CREATE|DROP|ALTER)/i.test(sqliteText);
  
  if (!isDDL) {
    sqliteText = sqliteText
      .replace(/\$\d+/g, '?')  // Convert $1, $2 to ?
      .replace(/NOW\(\)/g, "datetime('now')")
      .replace(/EXTRACT\(MONTH FROM (.+)\)/g, "CAST(strftime('%m', $1) AS INTEGER)")
      .replace(/EXTRACT\(YEAR FROM (.+)\)/g, "CAST(strftime('%Y', $1) AS INTEGER)")
      .replace(/CURRENT_DATE - INTERVAL '(.+)'/g, "date('now', '-$1')")
      .replace(/CURRENT_DATE \+ INTERVAL '(.+)'/g, "date('now', '+$1')")
      .replace(/COALESCE\(/g, 'ifnull(')
      .replace(/ON CONFLICT/g, '')
      .replace(/DO UPDATE SET/g, '')
      .replace(/DO NOTHING/g, '');
  } else {
    // DDL conversions
    sqliteText = sqliteText
      .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/BOOLEAN DEFAULT TRUE/g, 'BOOLEAN DEFAULT 1')
      .replace(/BOOLEAN DEFAULT FALSE/g, 'BOOLEAN DEFAULT 0')
      .replace(/TEXT\[\]/g, 'TEXT')
      .replace(/JSONB/g, 'TEXT')
      .replace(/CHECK \(.+\)/g, '');
  }
  
  // General conversions (safe for both DDL and DML)
  sqliteText = sqliteText
    .replace(/::VARCHAR/g, '')
    .replace(/::INTEGER/g, '')
    .replace(/::DECIMAL/g, '')
    .replace(/::BOOLEAN/g, '')
    .replace(/::DATE/g, '')
    .replace(/::TEXT/g, '');

  // Handle INSERT...RETURNING for SQLite
  if (sqliteText.includes('RETURNING')) {
    const insertMatch = sqliteText.match(/INSERT INTO (\w+)\s*\(([\s\S]*?)\)\s*VALUES\s*\(([\s\S]*?)\)/i);
    if (insertMatch) {
      const table = insertMatch[1];
      sqliteText = sqliteText.replace(/\s*RETURNING\s+.+$/i, '');
      const result = await sqliteRun(sqliteText, params);
      // Fetch the inserted row
      const rowResult = await sqliteQuery(
        `SELECT * FROM ${table} WHERE id = ?`,
        [result.lastID]
      );
      return { rows: rowResult.rows, rowCount: 1 };
    }
  }

  const result = isDDL || /^\s*(INSERT|UPDATE|DELETE)/i.test(sqliteText) 
    ? await sqliteRun(sqliteText, params)
    : await sqliteQuery(sqliteText, params);
  const duration = Date.now() - start;
  logger.debug('SQLite query', { duration, rows: result.rowCount });
  return result;
}

// Transaction helper
async function transaction(callback) {
  if (usePostgres && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // SQLite transaction
  const db = getSQLiteDb();
  await sqliteRun('BEGIN');
  try {
    const result = await callback({
      query: (sql, params) => sqliteQuery(sql, params),
      run: (sql, params) => sqliteRun(sql, params)
    });
    await sqliteRun('COMMIT');
    return result;
  } catch (error) {
    await sqliteRun('ROLLBACK');
    throw error;
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  getSQLiteDb
};
