import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * 브랜드 로고 — 「作」 한자 마크(1안) + 세리프 워드마크.
 * 마크는 라이트에서 흰 바탕/먹색 글자, 다크에서 반전된다.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl border border-line",
        "bg-foreground font-serif text-lg font-bold leading-none text-background",
        "shadow-[var(--shadow-soft)]",
        className
      )}
    >
      作
    </span>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 tracking-tight", className)}
    >
      <LogoMark />
      <span className="font-serif text-lg font-bold">
        작심<span className="text-accent">사</span>일
      </span>
    </Link>
  );
}
