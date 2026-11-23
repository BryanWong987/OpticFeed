
"use client";

import { useTheme } from "@/app/components/theme-provider";

export default function AppearanceToggle() {
    const { theme, toggleTheme, isSaving } = useTheme();

    const isDark = theme === "dark";

    return (
        <div>
            <button
                type="button"
                role="switch"
                aria-label="Toggle dark mode"
                aria-checked={isDark}
                onClick={toggleTheme}
                disabled={isSaving}
                className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? "bg-neutral-700" : "bg-neutral-300"
                    } ${isSaving ? "cursor-wait opacity-70" : "cursor-pointer"}`}
            >
                <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${isDark ? "translate-x" : "-translate-x-5"
                        }`}
                />
            </button>
        </div>
    );
}
