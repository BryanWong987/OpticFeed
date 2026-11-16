import pool from '@/app/lib/db';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

// Execute an individual query without stopping the remaining seed operations.
async function runQuery(
    pool: Pool,
    description: string,
    sql: string,
    values: unknown[] = []
) {
    try {
        const [results] = await pool.query(sql, values);
        console.log(`Seed successful for: ${description}`);
        return results;
    } catch (error) {
        console.error(`Seed failed (${description}):`, error);
        return null;
    }
}

export async function seedAccounts(pool: Pool) {
    await runQuery(
        pool,
        'Create accounts table',
        `CREATE TABLE IF NOT EXISTS accounts (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(20) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            preferences VARCHAR(1000),
            img_path VARCHAR(200)
        )`
    );


    const hashPassword = await bcrypt.hash("Password_123", 12);

    await runQuery(
        pool,
        'Insert sample account user123',
        `INSERT INTO accounts (username, email, password)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE user_id = user_id`,
        ['user123', 'a@example.com', hashPassword]
    );

    await runQuery(
        pool,
        'Insert sample account Contrarian',
        `INSERT INTO accounts (username, email, password)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE user_id = user_id`,
        ['Contrarian', 'c@example.com', hashPassword]
    );
}

export async function seedTopics(pool: Pool) {
    await runQuery(
        pool,
        'Create topics table',
        `CREATE TABLE IF NOT EXISTS topics (
            topic_id INT AUTO_INCREMENT PRIMARY KEY,
            topic_type VARCHAR(20) NOT NULL,
            title VARCHAR(100) UNIQUE NOT NULL,
            slug VARCHAR(150) UNIQUE NOT NULL,
            status VARCHAR(10) NOT NULL,
            interested_count INT,
            topic_body VARCHAR(2000)
        )`
    );

    await runQuery(
        pool,
        'Insert Death Row topic',
        `INSERT INTO topics
            (topic_type, title, slug, status, interested_count, topic_body)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE topic_id = topic_id`,
        [
            'Informative',
            'Death Row',
            'death-row',
            'Published',
            1617,
            'Topic relating to death row news.'
        ]
    );

    await runQuery(
        pool,
        'Insert Indie Gamers topic',
        `INSERT INTO topics
            (topic_type, title, slug, status, interested_count, topic_body)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE topic_id = topic_id`,
        [
            'Networking',
            'Indie Gamers',
            'indie-gamers',
            'Published',
            581,
            'Looking for fellow indie gamers? You have found your place!'
        ]
    );
}

export async function seedPosts(pool: Pool) {
    await runQuery(
        pool,
        'Create posts table',
        `CREATE TABLE IF NOT EXISTS posts (
            post_id INT AUTO_INCREMENT PRIMARY KEY,
            topic_id int NOT NULL,
            creator_id int NOT NULL,
            post_type VARCHAR(10) NOT NULL,
            news_links VARCHAR(500),
            title VARCHAR(200) NOT NULL,
            num_views INT NOT NULL,
            num_comments int NOT NULL,
            post_body VARCHAR(2000) NOT NULL,

            CONSTRAINT fkey_topics
                FOREIGN KEY (topic_id) REFERENCES topics(topic_id),

            CONSTRAINT fkey_post_creator
                FOREIGN KEY (creator_id) REFERENCES accounts(user_id)
        )`
    );

    await runQuery(
        pool,
        'Insert post #1 into Death Row topic (created by user123)',
        `INSERT INTO posts
            (topic_id, creator_id, title, num_views, num_comments, post_body)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE post_id = post_id`,
        [
            1,
            1,
            'Execution Negligence',
            0,
            0,
            'I believe there was negligence regarding the Christa Pike \
            incident. What do you guys think?'
        ]
    );

    await runQuery(
        pool,
        'Insert post #2 into Death Row topic (created by user123)',
        `INSERT INTO posts
            (topic_id, creator_id, title, num_views, num_comments, post_body)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE post_id = post_id`,
        [
            1,
            1,
            'Should the Death Penalty be legal?',
            0,
            0,
            'I think there are too many problems that can happen by allowing \
            the death penalty. What do you guys think?'
        ]
    );
}

export async function seedComments(pool: Pool) {
    await runQuery(
        pool,
        'Create comments table',
        `CREATE TABLE IF NOT EXISTS comments (
            comment_id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id int,
            post_id int NOT NULL,
            user_id int NOT NULL,
            comment_body VARCHAR(2000) NOT NULL,

            CONSTRAINT fkey_comments
                FOREIGN KEY (parent_id) REFERENCES comments(comment_id),

            CONSTRAINT fkey_posts
                FOREIGN KEY (post_id) REFERENCES posts(post_id),

            CONSTRAINT fkey_comment_user
            FOREIGN KEY (user_id) REFERENCES accounts(user_id)
        )`
    );

    await runQuery(
        pool,
        'Insert comment #1 into Execution Negligence post for Death Row topic (created by Contrarian)',
        `INSERT INTO comments
            (post_id, user_id, comment_body)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE comment_id = comment_id`,
        [
            1,
            2,
            'No.'
        ]
    );

    await runQuery(
        pool,
        'Insert comment #1 into Death Penalty Legalization post for Death Row topic (created by Contrarian)',
        `INSERT INTO comments
            (post_id, user_id, comment_body)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE comment_id = comment_id`,
        [
            2,
            2,
            'No. Your opinion is horrible'
        ]
    );
}


// Run all seed functions
async function seedDatabase(pool: Pool) {
    await seedAccounts(pool);
    await seedTopics(pool);
    await seedPosts(pool);
    await seedComments(pool);
}

async function resetDatabase(pool: Pool) {
    await runQuery(
        pool,
        'Drop comments table',
        'DROP TABLE IF EXISTS comments');

    await runQuery(
        pool,
        'Drop posts table',
        'DROP TABLE IF EXISTS posts');

    await runQuery(
        pool,
        'Drop topics table',
        'DROP TABLE IF EXISTS topics');

    await runQuery(
        pool,
        'Drop accounts table',
        'DROP TABLE IF EXISTS accounts');
    
}


async function main() {
    const seedPool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 5,
    });

    try {
        await resetDatabase(seedPool);

        await seedDatabase(seedPool);

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Database seeding failed:', error);
        process.exitCode = 1;
    } finally {
        // Close the MySQL connection pool
        await seedPool.end();
        console.log('Database connection pool closed.');
    }
}

main();