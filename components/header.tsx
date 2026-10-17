"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const search = query.trim();

        if (!search) return;

        router.push(`/search?q=${encodeURIComponent(search)}`);
    }


    return (
        <header className="border-b border-gray-200 bg-gray-200">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="text-2xl font-bold text-gray-900"
                >
                    OpticFeed
                </Link>

                <form
                    onSubmit={handleSearch}
                    role="search"
                    className="w-full max-w-md"
                >
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search OpticFeed Posts"
                        aria-label="Search"
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </form>

                <div className="flex items-center gap-6">

                    <Link
                        href="/login"
                        className="text-gray-600 hover:text-blue-600"
                    >
                        Login
                    </Link>

                    <Link
                        href="/settings"
                        className="text-gray-600 hover:text-blue-600"
                    >
                        Settings
                    </Link>
                </div>
            </nav>
        </header>
    );
}
