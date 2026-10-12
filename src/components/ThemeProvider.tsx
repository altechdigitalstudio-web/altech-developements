"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { IconMoon, IconSun } from "@/components/icons";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Read stored setting or default to system
    let initial: Theme = "system";
    try {
      const saved = localStorage.getItem("altech_theme") as Theme | null;
      if (saved === "dark" || saved === "light" || saved === "system") {
        initial = saved;
      }
    } catch {
      /* ignore */
    }

    setThemeState(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (mode: Theme) => {
      const systemDark = media.matches;
      const isDark = mode === "dark" || (mode === "system" && systemDark);
      const active = isDark ? "dark" : "light";
      setResolvedTheme(active);
      document.documentElement.setAttribute("data-theme", active);
      document.documentElement.classList.toggle("dark", isDark);
    };

    apply(initial);

    const onChange = () => {
      // If user is using system default, follow live device changes
      try {
        const saved = localStorage.getItem("altech_theme") as Theme | null;
        if (!saved || saved === "system") {
          apply("system");
        }
      } catch {
        apply("system");
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      if (next === "system") {
        localStorage.removeItem("altech_theme");
      } else {
        localStorage.setItem("altech_theme", next);
      }
    } catch {
      /* ignore */
    }

    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = next === "dark" || (next === "system" && systemDark);
    const active = isDark ? "dark" : "light";
    setResolvedTheme(active);
    document.documentElement.setAttribute("data-theme", active);
    document.documentElement.classList.toggle("dark", isDark);
  };

  const toggleTheme = () => {
    // Toggle between explicit light and dark
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={resolvedTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-main hover:border-border-hover transition-all shadow-xs ${className}`}
      aria-label="Toggle visual theme"
    >
      {resolvedTheme === "light" ? (
        <>
          <IconMoon width={14} height={14} className="text-slate-600" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <IconSun width={14} height={14} className="text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}
