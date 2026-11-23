
'use server';

import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

import { revalidatePath } from 'next/cache';

import { verifySession } from '@/app/lib/session';

import {
    getAuthUserById,
    updateUserProfilePicture,
} from '@/app/lib/dal';

import {
    getProfilePictureDirectory,
    getImageType,
    MAX_PROFILE_PICTURE_SIZE,
    PROFILE_PICTURE_TYPES,
} from '@/app/lib/profile-picture';


export type ProfilePictureState = {
    message?: string;
    success?: boolean;
    imagePath?: string;
} | undefined;


export async function updateProfilePicture(
    state: ProfilePictureState,
    formData: FormData
): Promise<ProfilePictureState> {
    const session = await verifySession();

    if (!session.isAuth || !session.userId) {
        return {
            message: 'You must be logged in to update your profile picture.',
        };
    }

    // Retrieve the uploaded file
    const file = formData.get('profilePicture');

    if (!(file instanceof File) || file.size === 0) {
        return {
            message: 'Please select an image to upload.',
        };
    }

    // Validate the file size
    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
        return {
            message: 'The image must be smaller than 5 MB.',
        };
    }

    let newFilePath: string | null = null;

    try {
        // Retrieve the account and its existing image path
        const user = await getAuthUserById(session.userId);

        if (!user) {
            return {
                message: 'Unable to locate your account.',
            };
        }

        // Read and validate the actual image contents
        const bytes = new Uint8Array(await file.arrayBuffer());

        const imageType = getImageType(bytes);

        if (!imageType) {
            return {
                message: 'Please upload a valid JPEG, PNG, or WebP image.',
            };
        }

        const imageDetails = PROFILE_PICTURE_TYPES[imageType];

        // Generate a unique filename
        const filename =
            `${session.userId}-${randomBytes(16).toString('hex')}.${imageDetails.extension}`;

        const directory = getProfilePictureDirectory();

        await mkdir(directory, { recursive: true });

        newFilePath = path.join(directory, filename);

        // Save the image.
        await writeFile(newFilePath, bytes, { flag: 'wx' });

        const imagePath = `/api/profile-picture/${filename}`;

        // Update the database.
        await updateUserProfilePicture(
            session.userId,
            imagePath
        );

        // The new file is now referenced by the database.
        // Do not remove it if a subsequent operation fails.
        newFilePath = null;

        // Delete the previous image, if it belongs to this user
        const previousPath = user.img_path;

        if (previousPath) {
            const previousFilename = previousPath.split('/').pop();

            if (
                previousFilename &&
                previousFilename.startsWith(`${session.userId}-`) &&
                /^[0-9]+-[a-f0-9]{32}\.(jpg|png|webp)$/.test(previousFilename)
            ) {
                try {
                    await unlink(
                        path.join(directory, previousFilename)
                    );
                } catch (error) {
                    console.error(
                        'Previous profile picture cleanup error:',
                        error
                    );
                }
            }
        }

        // 10. Refresh the Settings page.
        revalidatePath('/settings');

        return {
            success: true,
            message: 'Your profile picture has been updated.',
            imagePath,
        };

    } catch (error) {
        // Remove the newly uploaded file if the operation failed.
        if (newFilePath) {
            try {
                await unlink(newFilePath);
            } catch {
                // File may not have been created.
            }
        }

        console.error('Profile picture upload error:', error);

        return {
            message: 'An error occurred while updating your profile picture.',
        };
    }
}
