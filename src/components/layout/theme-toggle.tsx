"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const getInitialTheme = () => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    return stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
};

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    const toggle = () => {
        setIsDark(prev => !prev);
    };

    if (typeof window === "undefined") return null;

    return (
        <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-all duration-300 active:scale-90"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
                <Moon className="w-4 h-4 text-slate-600" />
            )}
        </button>
    );
}
