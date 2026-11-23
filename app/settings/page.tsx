import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/dal";
import AppearanceToggle from "./appearance-toggle";
import PasswordForm from "./password-form";
import ProfilePictureForm from "./profile-picture-form";

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
                <ProfilePictureForm
                    username={user.username}
                    imgPath={user.img_path}
                />

                {/* Account actions */}
                <div className="divide-y divide-border">
                    <PasswordForm />

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
