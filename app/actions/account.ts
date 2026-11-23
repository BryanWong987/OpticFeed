
'use server';

import bcrypt from 'bcrypt';
import { z } from 'zod';

import { ChangePasswordSchema, ChangePasswordState } from '@/app/lib/definitions';

import {
    getAuthUserById,
    updateUserPassword
} from '@/app/lib/dal';

import { verifySession } from '@/app/lib/session';


export async function changePassword(
    state: ChangePasswordState,
    formData: FormData
): Promise<ChangePasswordState> {

    // 1. Verify that the user is authenticated.
    const session = await verifySession();

    if (!session.isAuth || !session.userId) {
        return {
            message: 'You must be logged in to change your password.',
        };
    }

    // 2. Validate the submitted fields.
    const validatedFields = ChangePasswordSchema.safeParse({
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
    });

    if (!validatedFields.success) {
        const tree = z.treeifyError(validatedFields.error);

        return {
            errors: {
                currentPassword: tree.properties?.currentPassword,
                newPassword: tree.properties?.newPassword,
                confirmPassword: tree.properties?.confirmPassword,
            },
        };
    }

    // 3. Retrieve the authenticated user's account.
    try {
        const user = await getAuthUserById(session.userId);

        if (!user) {
            return {
                message: 'Unable to locate your account.',
            };
        }

        const {
            currentPassword,
            newPassword,
        } = validatedFields.data;

        // 4. Verify the current password.
        const validPassword = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!validPassword) {
            return {
                errors: {
                    currentPassword: {
                        errors: ['Your current password is incorrect.'],
                    },
                },
            };
        }

        // 5. Hash the new password.
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // 6. Update the password in MySQL.
        await updateUserPassword(
            session.userId,
            hashedPassword
        );

        // 7. Return a success message.
        return {
            success: true,
            message: 'Your password has been successfully updated.',
        };

    } catch (error) {
        console.error('Password change error:', error);

        return {
            message: 'An error occurred while changing your password.',
        };
    }
}
