import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-bold tracking-tight", className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-base">
        🌱
      </span>
      <span className="text-lg">
        작심<span className="text-accent">사</span>일
      </span>
    </Link>
  );
}
