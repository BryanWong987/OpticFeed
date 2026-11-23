import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/dal";
import AppearanceToggle from "./appearance-toggle";

export default function SettingsPage() {
    return (
        <main className="mx-auto max-w-3xl space-y-8 p-6">
            <h1 className="text-3xl font-bold text-foreground">
                Settings
            </h1>

            <Suspense fallback={<p className="text-muted">Loading settings...</p>}>
                <SettingsContent />
            </Suspense>
        </main>
    );
}

async function SettingsContent() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-8">
            {/* Preferences */}
            <section className="rounded-lg border border-border bg-surface p-6 shadow-md">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Preferences
                </h2>

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="font-medium text-foreground">
                            Appearance
                        </h3>
                        <p className="text-sm text-muted">
                            Switch between light and dark mode.
                        </p>
                    </div>

                    <AppearanceToggle />
                </div>
            </section>

            {/* Account */}
            <section className="rounded-lg border border-border bg-surface p-6 shadow-md">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Account
                </h2>

                {/* Profile picture */}
                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-secondary">
                        {user.img_path ? (
                            <img
                                src={user.img_path}
                                alt={`${user.username}'s profile picture`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-10 w-10 text-muted"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 21a8 8 0 0 0-16 0"
                                />
                                <circle cx="12" cy="8" r="4" />
                            </svg>
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                            {user.username}
                        </h3>
                        <p className="text-sm text-muted">
                            {user.email}
                        </p>

                        <button
                            type="button"
                            disabled
                            className="mt-3 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted opacity-70"
                        >
                            Edit Picture
                        </button>
                    </div>
                </div>

                {/* Account actions */}
                <div className="divide-y divide-border">
                    <div className="flex items-center justify-between gap-4 py-5">
                        <div>
                            <h3 className="font-medium text-foreground">
                                Password
                            </h3>
                            <p className="text-sm text-muted">
                                Change your account password.
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled
                            className="shrink-0 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted opacity-70"
                        >
                            Reset Password
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-5">
                        <div>
                            <h3 className="font-medium text-foreground">
                                Delete Account
                            </h3>
                            <p className="text-sm text-muted">
                                Permanently delete your OpticFeed account.
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled
                            className="shrink-0 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-400 opacity-70"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
