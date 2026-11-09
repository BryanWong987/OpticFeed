// Data Access Layer for managing logged in user sessions on OpticFeed.
import 'server-only';

import pool from '@/app/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getSession } from '@/app/lib/session';

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

    const session = await getSession();

    if (!session?.userId) {
        return null;
    }

    const user_id = Number(session.userId);

    if (!Number.isSafeInteger(user_id) || user_id <= 0) {
        return null;
    }

    return getUserById(user_id);
}