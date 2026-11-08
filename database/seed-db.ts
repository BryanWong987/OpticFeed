// Get the client
// import { connection } from '@/app/lib/db';
import mysql from 'mysql2/promise';

const insertSampleData = true; // todo set flag in start.sh to seed or not

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
        console.error('Seed for accounts table failed:', error);
    } finally {
        await connection.end();
    }
}

export async function seedTopics() {
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
        // await connection.query(`DROP TABLE comments;`);
        // await connection.query(`DROP TABLE posts;`);
        // await connection.query(`DROP TABLE topics;`);

        const createTopicsTable = `CREATE TABLE IF NOT EXISTS topics (
                topic_id INT AUTO_INCREMENT PRIMARY KEY,
                topic_type VARCHAR(20) NOT NULL,
                title VARCHAR(100) UNIQUE NOT NULL,
                slug VARCHAR(150) UNIQUE NOT NULL,
                status VARCHAR(10) NOT NULL,
                interested_count INT,
                topic_body VARCHAR(2000)
            );`;

        await connection.query(createTopicsTable);

        if (insertSampleData) {
            // TODO catch seeding failures if the same data already exists (and proceed to seed next data)

            await connection.query(`INSERT INTO topics (topic_type, title, slug, status, interested_count, topic_body) 
            VALUES ('Informative', 'Death Row', 'death-row', 'Published', '1617', 'Topic relating to death row news.');`);

            await connection.query(`INSERT INTO topics (topic_type, title, slug, status, interested_count, topic_body) 
            VALUES ('Networking', 'Indie Gamers', 'indie-gamers', 'Published', '581', 'Looking for fellow indie gamers? You have found your place!');`);
        }

        const [results, fields] = await connection.query(`SELECT * from topics;`);

        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
    } catch (error) {
        console.error('Seed for topics table failed:', error);
    } finally {
        await connection.end();
    }
}

seedAccounts();
seedTopics();