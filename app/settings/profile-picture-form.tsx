
'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    updateProfilePicture,
    ProfilePictureState,
} from '@/app/actions/profile-picture';


export default function ProfilePictureForm({
    username,
    imgPath,
}: {
    username: string;
    imgPath: string | null;
}) {

    const router = useRouter();

    const initialState: ProfilePictureState = undefined;

    const [state, formAction, pending] = useActionState(
        updateProfilePicture,
        initialState
    );

    useEffect(() => {
        if (state?.success) {
            router.refresh();
        }
    }, [state?.success, router]);

    const displayedImage = state?.imagePath ?? imgPath;

    return (
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">

            {/* Profile picture */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-secondary">

                {displayedImage ? (
                    <img
                        src={displayedImage}
                        alt={`${username}'s profile picture`}
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

            {/* Account information and upload form */}
            <div className="min-w-0 flex-1">

                <h3 className="font-medium text-foreground">
                    {username}
                </h3>

                <p className="text-sm text-muted">
                    Update your profile picture.
                </p>

                <form
                    key={state?.success ? 'success' : 'upload'}
                    action={formAction}
                    className="mt-3 space-y-3"
                >

                    <div>
                        <label
                            htmlFor="profilePicture"
                            className="mb-2 block text-sm font-medium text-foreground"
                        >
                            Choose an image
                        </label>

                        <input
                            id="profilePicture"
                            name="profilePicture"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required
                            disabled={pending}
                            className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-surface"
                        />
                    </div>

                    <p className="text-xs text-muted">
                        Accepted formats: JPEG, PNG, and WebP. Maximum size: 5 MB.
                    </p>

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

                    <button
                        type="submit"
                        disabled={pending}
                        className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending ? 'Uploading...' : 'Update Picture'}
                    </button>

                </form>
            </div>
        </div>
    );
}
