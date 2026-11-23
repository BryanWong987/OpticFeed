
"use server";

import { getCurrentUser, updateUserTheme, type Theme } from "@/app/lib/dal";

export async function saveThemePreference(
    theme: Theme
): Promise<void> {
    // Validate the requested theme.
    if (theme !== "light" && theme !== "dark") {
        throw new Error("Invalid theme preference.");
    }

    // Ensure the user is authenticated.
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("You must be logged in to update preferences.");
    }

    // Save the preference in MySQL.
    await updateUserTheme(user.user_id, theme);
}
