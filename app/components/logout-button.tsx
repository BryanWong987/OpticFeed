'use client';

import { logout } from '@/app/actions/auth';

export default function LogoutButton() {
    return (
        <form action={logout}>
            <button
                type="submit"
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
                Log Out
            </button>
        </form>
    );
}
