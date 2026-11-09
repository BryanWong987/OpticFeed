import path from 'path';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;

// Reuse the pool during Next.js development hot reloads.
// declare global {
//   var mysqlPool: mysql.Pool | undefined;
// }

// const db = globalThis.mysqlPool ?? pool;

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.mysqlPool = db;
// }

// export default db;