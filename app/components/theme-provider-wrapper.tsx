
import { getCurrentUser, getThemeFromPreferences } from "@/app/lib/dal";
import ThemeProvider from "@/app/components/theme-provider";

import type { ReactNode } from "react";

export default async function ThemeProviderWrapper({
    children,
}: {
    children: ReactNode;
}) {
    const user = await getCurrentUser();

    const initialTheme = getThemeFromPreferences(
        user?.preferences ?? null
    );

    return (
        <ThemeProvider initialTheme={initialTheme}>
            {children}
        </ThemeProvider>
    );
}
