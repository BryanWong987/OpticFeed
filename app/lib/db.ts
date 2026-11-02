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

// Create table if it doesn't exist yet
// connection.exec(`
//   CREATE TABLE IF NOT EXISTS accounts (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT NOT NULL UNIQUE,
//     email TEXT NOT NULL UNIQUE,
//     password TEXT NOT NULL,
//     role TEXT
//   )
// `);