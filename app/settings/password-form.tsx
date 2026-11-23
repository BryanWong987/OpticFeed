
'use client';

import { useActionState, useState } from 'react';
import { changePassword } from '@/app/actions/account';

const initialState = undefined;

export default function PasswordForm() {
    const [isOpen, setIsOpen] = useState(false);

    const [state, formAction, pending] = useActionState(
        changePassword,
        initialState
    );

    return (
        <div className="py-5">
            <div className="flex items-center justify-between gap-4">
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
                    onClick={() => setIsOpen(!isOpen)}
                    className="shrink-0 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-secondary"
                >
                    {isOpen ? 'Cancel' : 'Reset Password'}
                </button>
            </div>

            {isOpen && (
                <form
                    key={state?.success ? 'success' : 'form'}
                    action={formAction}
                    className="mt-6 space-y-4"
                >
                    {/* Current password */}
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="mb-2 block text-sm font-medium text-foreground"
                        >
                            Current Password
                        </label>

                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            autoComplete="current-password"
                            required
                            disabled={pending || state?.success}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                        />

                        {state?.errors?.currentPassword?.errors?.map(
                            (error, index) => (
                                <p
                                    key={index}
                                    className="mt-1 text-sm text-red-500"
                                >
                                    {error}
                                </p>
                            )
                        )}
                    </div>

                    {/* New password */}
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="mb-2 block text-sm font-medium text-foreground"
                        >
                            New Password
                        </label>

                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            disabled={pending || state?.success}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                        />

                        {state?.errors?.newPassword?.errors?.map(
                            (error, index) => (
                                <p
                                    key={index}
                                    className="mt-1 text-sm text-red-500"
                                >
                                    {error}
                                </p>
                            )
                        )}
                    </div>

                    {/* Confirm new password */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-medium text-foreground"
                        >
                            Confirm New Password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            disabled={pending || state?.success}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                        />

                        {state?.errors?.confirmPassword?.errors?.map(
                            (error, index) => (
                                <p
                                    key={index}
                                    className="mt-1 text-sm text-red-500"
                                >
                                    {error}
                                </p>
                            )
                        )}
                    </div>

                    {/* General message */}
                    {state?.message && (
                        <p
                            role="status"
                            aria-live="polite"
                            className={`text-sm ${state.success
                                    ? 'text-green-600'
                                    : 'text-red-500'
                                }`}
                        >
                            {state.message}
                        </p>
                    )}

                    {/* Submit */}
                    {!state?.success && (
                        <button
                            type="submit"
                            disabled={pending}
                            className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {pending ? 'Updating...' : 'Update Password'}
                        </button>
                    )}
                </form>
            )}
        </div>
    );
}
