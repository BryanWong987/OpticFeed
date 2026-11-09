import { Suspense } from 'react';
import { getCurrentUser } from '@/app/lib/dal';

export default function TestPage() {
    return (
        <main>
            <h1>Session Test</h1>

            <Suspense fallback={<p>Checking session...</p>}>
                <SessionInfo />
            </Suspense>
        </main>
    );
}

async function SessionInfo() {
    const user = await getCurrentUser();

    if (!user) {
        return <p>No active session.</p>;
    }

    return (
        <section>
            <p>Logged in as: {user.username}</p>
            <p>User ID: {user.user_id}</p>
            <p>Email: {user.email}</p>
        </section>
    );
}