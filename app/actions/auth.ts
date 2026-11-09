
'use server';

import {
    SignupFormSchema,
    LoginFormSchema,
    SignupState,
    LoginState
} from '@/app/lib/definitions';

import bcrypt from 'bcrypt';
import { z } from 'zod';
import { redirect } from 'next/navigation';

import {
    addAccount,
    getUserByUsername
} from '@/app/lib/dal';

import { createSession, deleteSession } from '@/app/lib/session';


export async function signup(
    state: SignupState,
    formData: FormData
): Promise<SignupState> {

    // 1. Validate form fields.
    const validatedFields = SignupFormSchema.safeParse({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        const tree = z.treeifyError(validatedFields.error);

        return {
            errors: {
                username: tree.properties?.username,
                email: tree.properties?.email,
                password: tree.properties?.password,
            },
        };
    }

    // 2. Prepare data.
    const { username, email, password } = validatedFields.data;

    // 3. Hash the password.
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Insert the account through the DAL.
    try {
        const user_id = await addAccount(
            username,
            email,
            hashedPassword
        );

        // 5. Create a session.
        await createSession(user_id);

    } catch (error) {
        // Handle duplicate username/email errors.
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ER_DUP_ENTRY'
        ) {
            return {
                message: 'Username or email is already registered.',
            };
        }

        console.error('Signup error:', error);

        return {
            message: 'An error occurred while creating your account.',
        };
    }

    // 6. Redirect after successful signup.
    redirect('/');
}


export async function login(
    state: LoginState,
    formData: FormData
): Promise<LoginState> {

    // 1. Validate form fields.
    const validatedFields = LoginFormSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        const tree = z.treeifyError(validatedFields.error);

        return {
            errors: {
                username: tree.properties?.username,
                password: tree.properties?.password,
            },
        };
    }

    // 2. Prepare data.
    const { username, password } = validatedFields.data;

    // 3. Retrieve the account through the DAL.
    const user = await getUserByUsername(username);

    if (!user) {
        return {
            message: 'Invalid username or password.',
        };
    }

    // 4. Verify the password.
    const validLogin = await bcrypt.compare(
        password,
        user.password
    );

    if (!validLogin) {
        return {
            message: 'Invalid username or password.',
        };
    }

    // 5. Create an authenticated session.
    await createSession(user.user_id);

    // 6. Redirect after successful login.
    redirect('/');
}

export async function logout() {
    await deleteSession();

    redirect('/login');
}
