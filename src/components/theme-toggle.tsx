"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { hydrated, isDark, setMode } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setMode(isDark ? "light" : "dark")}
      aria-label="테마 전환"
      className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all duration-300 [transition-timing-function:var(--ease-apple)] hover:scale-[1.05] hover:bg-surface hover:text-foreground"
    >
      {hydrated && (isDark ? <Sun size={18} /> : <Moon size={18} />)}
    </button>
  );
}
