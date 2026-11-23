import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

// Execute a query. Stop the operation if a query fails.
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
        throw error;
    }
}

async function seedAccounts(pool: Pool) {
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

    const hashPassword = await bcrypt.hash('Password_123', 12);

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

async function seedTopics(pool: Pool) {
    await runQuery(
        pool,
        'Create topics table',
        `CREATE TABLE IF NOT EXISTS topics (
            topic_id INT AUTO_INCREMENT PRIMARY KEY,
            topic_type ENUM('Networking', 'Informative') NOT NULL,
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

async function seedPosts(pool: Pool) {
    await runQuery(
        pool,
        'Create posts table',
        `CREATE TABLE IF NOT EXISTS posts (
            post_id INT AUTO_INCREMENT PRIMARY KEY,
            topic_id INT NOT NULL,
            creator_id INT NOT NULL,
            post_type ENUM('News', 'Discussion') NOT NULL,
            news_links TEXT,
            title VARCHAR(200) NOT NULL,
            num_views INT NOT NULL DEFAULT 0,
            num_comments INT NOT NULL DEFAULT 0,
            post_body VARCHAR(2000) NOT NULL,

            CONSTRAINT fkey_topics
                FOREIGN KEY (topic_id) REFERENCES topics(topic_id),

            CONSTRAINT fkey_post_creator
                FOREIGN KEY (creator_id) REFERENCES accounts(user_id)
        )`
    );

    // Insert only if a post with this title does not already exist
    // in the Death Row topic.
    await runQuery(
        pool,
        'Insert Execution Negligence post by user123',
        `INSERT INTO posts (
            topic_id,
            creator_id,
            post_type,
            news_links,
            title,
            num_views,
            num_comments,
            post_body
        )
        SELECT
            t.topic_id,
            a.user_id,
            'Discussion',
            NULL,
            'Execution Negligence',
            0,
            0,
            ?
        FROM topics t
        JOIN accounts a ON a.username = ?
        WHERE t.slug = ?
        AND NOT EXISTS (
            SELECT 1
            FROM posts p
            WHERE p.topic_id = t.topic_id
            AND p.title = ?
        )`,
        [
            'I believe there was negligence regarding the Christa Pike incident. What do you guys think?',
            'user123',
            'death-row',
            'Execution Negligence'
        ]
    );

    await runQuery(
        pool,
        'Insert Should the Death Penalty be legal post by user123',
        `INSERT INTO posts (
            topic_id,
            creator_id,
            post_type,
            news_links,
            title,
            num_views,
            num_comments,
            post_body
        )
        SELECT
            t.topic_id,
            a.user_id,
            'Discussion',
            NULL,
            'Should the Death Penalty be legal?',
            0,
            0,
            ?
        FROM topics t
        JOIN accounts a ON a.username = ?
        WHERE t.slug = ?
        AND NOT EXISTS (
            SELECT 1
            FROM posts p
            WHERE p.topic_id = t.topic_id
            AND p.title = ?
        )`,
        [
            'I think there are too many problems that can happen by allowing the death penalty. What do you guys think?',
            'user123',
            'death-row',
            'Should the Death Penalty be legal?'
        ]
    );
}

async function seedComments(pool: Pool) {
    await runQuery(
        pool,
        'Create comments table',
        `CREATE TABLE IF NOT EXISTS comments (
            comment_id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id INT,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
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
        'Insert comment into Execution Negligence post by Contrarian',
        `INSERT INTO comments (post_id, user_id, comment_body)
         SELECT p.post_id, a.user_id, ?
         FROM posts p
         JOIN accounts a ON a.username = ?
         WHERE p.title = ?
         AND NOT EXISTS (
             SELECT 1
             FROM comments c
             WHERE c.post_id = p.post_id
             AND c.user_id = a.user_id
             AND c.comment_body = ?
         )`,
        [
            'No.',
            'Contrarian',
            'Execution Negligence',
            'No.'
        ]
    );

    await runQuery(
        pool,
        'Insert comment into Death Penalty Legalization post by Contrarian',
        `INSERT INTO comments (post_id, user_id, comment_body)
         SELECT p.post_id, a.user_id, ?
         FROM posts p
         JOIN accounts a ON a.username = ?
         WHERE p.title = ?
         AND NOT EXISTS (
             SELECT 1
             FROM comments c
             WHERE c.post_id = p.post_id
             AND c.user_id = a.user_id
             AND c.comment_body = ?
         )`,
        [
            'No. Your opinion is horrible',
            'Contrarian',
            'Should the Death Penalty be legal?',
            'No. Your opinion is horrible'
        ]
    );

    // Keep the comment counters synchronized with the actual
    // number of comments, including replies.
    await runQuery(
        pool,
        'Update post comment counters',
        `UPDATE posts p
         SET p.num_comments = (
             SELECT COUNT(*)
             FROM comments c
             WHERE c.post_id = p.post_id
         )`
    );
}


// --------------------------------------------------
// Seed and reset operations
// --------------------------------------------------
async function seedDatabase(pool: Pool) {
    await seedAccounts(pool);
    await seedTopics(pool);
    await seedPosts(pool);
    await seedComments(pool);
}

async function resetDatabase(pool: Pool) {
    // Drop tables in reverse foreign-key dependency order
    await runQuery(pool, 'Drop comments table', 'DROP TABLE IF EXISTS comments');
    await runQuery(pool, 'Drop posts table', 'DROP TABLE IF EXISTS posts');
    await runQuery(pool, 'Drop topics table', 'DROP TABLE IF EXISTS topics');
    await runQuery(pool, 'Drop accounts table', 'DROP TABLE IF EXISTS accounts');
}

// --------------------------------------------------
// Main
// --------------------------------------------------
async function main() {
    const action = process.argv[2];

    if (action !== 'seed' && action !== 'reset') {
        console.error(
            'Please specify an action: "seed" or "reset".'
        );
        process.exitCode = 1;
        return;
    }

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
        if (action === 'reset') {
            console.log('Resetting database...');
            await resetDatabase(seedPool);
        }

        console.log('Seeding database...');
        await seedDatabase(seedPool);

        console.log('Database operation completed successfully!');
    } catch (error) {
        console.error('Database operation failed:', error);
        process.exitCode = 1;
    } finally {
        await seedPool.end();
        console.log('Database connection pool closed.');
    }
}

main();