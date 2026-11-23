// Data Access Layer for managing logged in user sessions on OpticFeed.
import 'server-only';

import pool from '@/app/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { verifySession } from '@/app/lib/session';

export type Theme = "light" | "dark";

// User account information returned to the application.
export interface Account {
    user_id: number;
    username: string;
    email: string;
    preferences: string | null;
    img_path: string | null;
}

// Account information used internally for authentication.
export interface AuthAccount extends Account {
    password: string;
}

export interface Post extends RowDataPacket {
    post_id: number;
    topic_id: number;
    creator_id: number;
    post_type: "News" | "Discussion";
    news_links: string | null;
    title: string;
    num_views: number;
    num_comments: number;
    post_body: string;

    // Additional information from JOINs when needed
    topic_slug: string;
    topic_title: string;
    creator_username: string;
}


export interface PostComment extends RowDataPacket {
    comment_id: number;
    parent_id: number | null;
    post_id: number;
    user_id: number;
    comment_body: string;
    username: string;
}



// Retrieve an account using its username.
export async function getUserByUsername(
    username: string
): Promise<AuthAccount | null> {

    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT user_id, username, email, password,
                preferences, img_path
         FROM accounts
         WHERE username = ?
         LIMIT 1`,
        [username]
    );

    if (rows.length === 0) {
        return null;
    }

    const user = rows[0];

    return {
        user_id: Number(user.user_id),
        username: user.username,
        email: user.email,
        password: user.password,
        preferences: user.preferences,
        img_path: user.img_path,
    };
}

// Retrieve an account using its user ID.
export async function getUserById(
    user_id: number
): Promise<Account | null> {

    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT user_id, username, email,
                preferences, img_path
         FROM accounts
         WHERE user_id = ?
         LIMIT 1`,
        [user_id]
    );

    if (rows.length === 0) {
        return null;
    }

    const user = rows[0];

    return {
        user_id: Number(user.user_id),
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        img_path: user.img_path,
    };
}

// Insert a new account into MySQL.
export async function addAccount(
    username: string,
    email: string,
    hash: string
): Promise<number> {

    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO accounts (username, email, password)
         VALUES (?, ?, ?)`,
        [username, email, hash]
    );

    return result.insertId;
}

// Retrieve the currently authenticated account.
export async function getCurrentUser(): Promise<Account | null> {

    const session = await verifySession();

    if (!session.isAuth || !session.userId) {
        return null;
    }

    // Retrieve the account from MySQL.
    const user = await getUserById(session.userId);

    return user;
}

// Read the theme preference from an account's preferences JSON.
export function getThemeFromPreferences(
    preferences: string | null
): Theme {
    if (!preferences) {
        return "light";
    }

    try {
        const parsed = JSON.parse(preferences);

        return parsed.theme === "dark" ? "dark" : "light";
    } catch {
        return "light";
    }
}

// Update a user's theme preference.
export async function updateUserTheme(
    userId: number,
    theme: Theme
): Promise<void> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT preferences
         FROM accounts
         WHERE user_id = ?
         LIMIT 1`,
        [userId]
    );

    if (rows.length === 0) {
        throw new Error("Account not found.");
    }

    let preferences: Record<string, unknown> = {};

    if (rows[0].preferences) {
        try {
            const parsed = JSON.parse(rows[0].preferences);

            if (
                parsed !== null &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
            ) {
                preferences = parsed;
            }
        } catch {
            // Existing preferences are not valid JSON.
            // Start with an empty object.
        }
    }

    preferences.theme = theme;

    await pool.execute(
        `UPDATE accounts
         SET preferences = ?
         WHERE user_id = ?`,
        [JSON.stringify(preferences), userId]
    );
}

// Add a topic to the topics database
export async function addTopic(
    userId: number,
    title: string,
    topic_type: "Networking" | "Informative",
    status: "Pending" | "Published",
    interested_count: number | null,
    topic_body: string
): Promise<number> {
    const title_slug = toSlug(title);


    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO topics (topic_type, title, slug, status, interested_count, topic_body)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [topic_type, title, title_slug, status, interested_count, topic_body]
    );

    return result.insertId;
}

export async function addPost(
    userId: number,
    topicId: number,
    title: string,
    post_type: "News" | "Discussion",
    news_links: string | null,
    post_body: string
): Promise<number> {

    const [result] = await pool.execute<ResultSetHeader>(
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            topicId,
            userId,
            post_type,
            news_links,
            title,
            0,
            0,
            post_body
        ]
    );

    return result.insertId;
}


export async function addComment(
    userId: number,
    postId: number,
    parentId: number | null,
    commentBody: string
): Promise<number> {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.execute<ResultSetHeader>(
            `INSERT INTO comments (parent_id, post_id, user_id, comment_body)
             VALUES (?, ?, ?, ?)`,
            [parentId, postId, userId, commentBody]
        );

        await connection.execute(
            `UPDATE posts
             SET num_comments = num_comments + 1
             WHERE post_id = ?`,
            [postId]
        );

        await connection.commit();

        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Retrieve a topic using its ID.
export async function getTopicById(
    topicId: number
): Promise<{ topic_id: number; slug: string } | null> {

    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT topic_id, slug
         FROM topics
         WHERE topic_id = ?
         LIMIT 1`,
        [topicId]
    );

    if (rows.length === 0) {
        return null;
    }

    return {
        topic_id: Number(rows[0].topic_id),
        slug: rows[0].slug,
    };
}

// Retrieve all posts associated with a topic
export async function getPostsByTopicId(
    topicId: number
): Promise<Post[]> {

    const [rows] = await pool.execute<Post[]>(
        `SELECT
            post_id,
            topic_id,
            creator_id,
            post_type,
            news_links,
            title,
            num_views,
            num_comments,
            post_body
         FROM posts
         WHERE topic_id = ?
         ORDER BY post_id DESC`,
        [topicId]
    );

    return rows;
}


// Retrieve an individual post using its ID and topic slug.
export async function getPostById(
    postId: number,
    topicSlug: string
): Promise<Post | null> {

    const [rows] = await pool.execute<Post[]>(
        `SELECT
            p.post_id,
            p.topic_id,
            p.creator_id,
            p.post_type,
            p.news_links,
            p.title,
            p.num_views,
            p.num_comments,
            p.post_body,
            t.slug AS topic_slug,
            t.title AS topic_title,
            a.username AS creator_username
         FROM posts p
         INNER JOIN topics t ON p.topic_id = t.topic_id
         INNER JOIN accounts a ON p.creator_id = a.user_id
         WHERE p.post_id = ?
         AND t.slug = ?
         LIMIT 1`,
        [postId, topicSlug]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}

// Retrieve comments associated with a post.
export async function getCommentsByPostId(
    postId: number
): Promise<PostComment[]> {
    const [rows] = await pool.execute<PostComment[]>(
        `SELECT
            c.comment_id,
            c.parent_id,
            c.post_id,
            c.user_id,
            c.comment_body,
            a.username
         FROM comments c
         INNER JOIN accounts a ON c.user_id = a.user_id
         WHERE c.post_id = ?
         ORDER BY c.comment_id ASC`,
        [postId]
    );

    return rows;
}

// Get a comment with the given comment id.
export async function getCommentById(
    commentId: number
): Promise<{ comment_id: number; post_id: number } | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT comment_id, post_id
         FROM comments
         WHERE comment_id = ?
         LIMIT 1`,
        [commentId]
    );

    if (rows.length === 0) return null;

    return {
        comment_id: Number(rows[0].comment_id),
        post_id: Number(rows[0].post_id),
    };
}


// Function to transform a string into slug format
// Useful in creating dynamic news links
function toSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()                                // Remove leading/trailing whitespace
        .replace(/[^\w\s-]/g, "")             // Remove all non-word characters (except spaces and dashes)
        .replace(/[\s_]+/g, "-")              // Replace spaces, underscores, and consecutive whitespace with a single dash
        .replace(/^-+|-+$/g, "");             // Remove any leftover leading or trailing dashes
}