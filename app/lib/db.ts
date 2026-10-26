import path from 'path';
import mysql from 'mysql2/promise';

// Using process.cwd() ensures a reliable absolute path across Next.js environments

// export const connection = await mysql.createPool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || '3306'),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
// });

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