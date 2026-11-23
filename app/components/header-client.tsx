"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

interface HeaderClientProps {
    username: string | null;
}

export default function HeaderClient({ username }: HeaderClientProps) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const search = query.trim();

        if (!search) return;

        router.push(`/search?q=${encodeURIComponent(search)}`);
    }

    return (
        <header className="border-b border-border bg-background">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">

                {/* Logo */}
                <Link
                    href="/"
                    className="shrink-0 text-2xl font-bold text-foreground transition-opacity hover:opacity-70"
                >
                    OpticFeed
                </Link>

                {/* Search */}
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
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/20"
                    />
                </form>

                {/* Navigation */}
                <div className="flex shrink-0 items-center gap-6">

                    <Link
                        href="/topics"
                        className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                        Topics (temporary)
                    </Link>

                    {username ? (
                        <>
                            <Link
                                href="/settings"
                                className="text-sm text-muted transition-colors hover:text-foreground"
                            >
                                {username}
                            </Link>

                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="text-sm text-muted transition-colors hover:text-foreground"
                                >
                                    Logout
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-muted transition-colors hover:text-foreground"
                            >
                                Login
                            </Link>

                            <Link
                                href="/settings"
                                className="text-sm text-muted transition-colors hover:text-foreground"
                            >
                                Settings
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
