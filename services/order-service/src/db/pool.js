const { Pool } = require('pg');
require("dotenv").config();
const DATABASE_URL = process.env.DATABASE_URL
const PGSSL = process.env.PGSSL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});

module.exports = pool;
