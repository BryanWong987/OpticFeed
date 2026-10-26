"use server";

import { SignupFormSchema, FormState } from '@/app/lib/definitions'
import bcrypt from 'bcrypt';
// import { connection } from '@/app/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mysql from 'mysql2/promise';


export async function signup(state: FormState, formData: FormData) {
    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        const tree = z.treeifyError(validatedFields.error);

        return {
            errors: {
                username: tree.properties?.username,
                email: tree.properties?.email,
                password: tree.properties?.password,
            },
        }
    }

    // 2. Prepare data for insertion into database
    const { username, email, password } = validatedFields.data;
    // Hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(password, 12);
    // 3. Insert the user into the database or call an Auth Library's API
    const user = await addAccount(username, email, hashedPassword);

    // if (!user) {
    //     return {
    //         message: 'An error occurred while creating your account.',
    //     }
    // }
    // TODO:
    // 4. Create user session
    // 5. Redirect user
}


async function addAccount(username: string, email: string, hash: string) {
    // 'use server';
    const connection = await mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    // const info = connection.prepare(
    //     'INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)'
    // ).run(username, email, hash);
    

    const result = await connection.execute(
        'INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)', [username, email, hash]);
    revalidatePath('/login'); // Refresh the page data
}