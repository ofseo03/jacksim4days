"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, Settings, User } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/dashboard", label: "홈", icon: Home },
  { href: "/statistics", label: "통계", icon: BarChart3 },
  { href: "/profile", label: "프로필", icon: User },
  { href: "/settings", label: "설정", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 상단 바 */}
      <header className="glass sticky top-0 z-40 border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Logo href="/dashboard" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                    "transition-all duration-300 [transition-timing-function:var(--ease-apple)]",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-8 md:pb-16">
        {children}
      </main>

      {/* 모바일 하단 탭 */}
      <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-4 py-1.5 text-[11px] font-medium",
                  "transition-colors duration-300",
                  active ? "text-accent-strong" : "text-muted"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
