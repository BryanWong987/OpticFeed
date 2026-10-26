// Get the client
// import { connection } from '@/app/lib/db';
import mysql from 'mysql2/promise';

export async function seedAccounts() {
    const connection = await mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    try {
        const create_accounts_table = `CREATE TABLE IF NOT EXISTS accounts( \
            user_id INT AUTO_INCREMENT PRIMARY KEY, \
            username VARCHAR(20) NOT NULL, \
            email VARCHAR(100) UNIQUE NOT NULL, \
            password VARCHAR(255) NOT NULL, \
            preferences VARCHAR(1000), \
            img_path VARCHAR(200));`;

        // const [results] = await connection.query(create_accounts_table);

        // // 2. Cast results to an array of standard mysql2 types
        // const batchResults = results as [ResultSetHeader, RowDataPacket[]];

        // // 3. Access your data by its statement index
        // const insertInfo = batchResults[0];
        // const userRows = batchResults[1];


        await connection.query(create_accounts_table);

        await connection.query(`INSERT INTO accounts (username, email, password) 
            VALUES ('user123', 'a@example.com', 'password123');`);

        const [results, fields] = await connection.query(`SELECT * from accounts;`);

        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
    } catch (error) {
        console.error('Batch failed:', error);
    } finally {
        await connection.end();
    }
}

seedAccounts();