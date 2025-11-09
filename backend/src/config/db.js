import mysql from 'mysql2/promise';
import 'dotenv/config';

let pool;

export function getDbPool() {
  if (!pool) {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'appuser',
      password: process.env.DB_PASSWORD || 'apppassword',
      database: process.env.DB_NAME || 'theology',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };

    console.log('Creating new database pool with config:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      connectionLimit: config.connectionLimit
    });

    pool = mysql.createPool(config);
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
