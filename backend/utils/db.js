const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const connectionString =
  (isProduction ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV) ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'Database connection string is not defined. Set DATABASE_URL_DEV / DATABASE_URL_PROD or DATABASE_URL.'
  );
}

const needsSSL =
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  /neon\.tech/.test(connectionString);

const pool = new Pool({
  connectionString,
  ...(needsSSL ? { ssl: { rejectUnauthorized: false } } : {})
});

module.exports = pool;
