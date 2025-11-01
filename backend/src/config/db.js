import mysql from 'mysql2/promise';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from authconfig.env
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../authconfig.env') });

let pool;

export function getDbPool() {
  if (!pool) {
    console.log('Creating new database pool with config:', {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      connectionLimit: 10
    });

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

export async function verifyDbConnection() {
  const poolInstance = getDbPool();
  const connection = await poolInstance.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
