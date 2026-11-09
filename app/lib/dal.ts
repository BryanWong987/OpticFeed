// Data Access Layer for managing logged in user sessions on OpticFeed.
import 'server-only';

import pool from '@/app/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { verifySession } from '@/app/lib/session';

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

// Add a topic to the topics database
export async function addTopic(
    userId: number,
    title: string,
    topic_type: "Networking" | "Informative",
    status: "Pending" | "Published",
    topic_body: string
): Promise<number> {
    const title_slug = toSlug(title);


    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO topics (topic_type, title, slug, status, interested_count, topic_body)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [topic_type, title, title_slug, "Published", 0, topic_body]
    );

    return result.insertId;
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