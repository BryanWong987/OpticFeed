
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useTransition,
    type ReactNode,
} from "react";

import { saveThemePreference } from "@/app/actions/preferences";
import type { Theme } from "@/app/lib/dal";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isSaving: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    initialTheme: Theme;
}

export default function ThemeProvider({
    children,
    initialTheme,
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(initialTheme);
    const [isSaving, startTransition] = useTransition();

    // Apply the selected theme to the root HTML element.
    useEffect(() => {
        const root = document.documentElement;

        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;
    }, [theme]);

    function toggleTheme() {
        const previousTheme = theme;
        const nextTheme: Theme =
            theme === "light" ? "dark" : "light";

        // Update the interface immediately.
        setTheme(nextTheme);

        // Persist the preference in the database.
        startTransition(async () => {
            try {
                await saveThemePreference(nextTheme);
            } catch (error) {
                console.error("Failed to save theme preference:", error);

                // Restore the previous theme if saving fails.
                setTheme(previousTheme);
            }
        });
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isSaving }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Access the theme from any Client Component.
export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider.");
    }

    return context;
}
