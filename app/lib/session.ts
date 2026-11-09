import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
    throw new Error('SESSION_SECRET is not configured.');
}

const encodedKey = new TextEncoder().encode(secretKey);

// Create a new authenticated session.
export async function createSession(user_id: number) {

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const session = await new SignJWT({
        userId: String(user_id),
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey);

    const cookieStore = await cookies();

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}


// Verify the session and return its user ID.
export async function verifySession(): Promise<{
    isAuth: boolean;
    userId: number | null;
}> {

    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
        return {
            isAuth: false,
            userId: null,
        };
    }

    try {
        const { payload } = await jwtVerify(
            session,
            encodedKey,
            {
                algorithms: ['HS256'],
            }
        );

        const userId = Number(payload.userId);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return {
                isAuth: false,
                userId: null,
            };
        }

        return {
            isAuth: true,
            userId,
        };

    } catch {
        // Invalid or expired session.
        return {
            isAuth: false,
            userId: null,
        };
    }
}

// Delete the session cookie.
export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
