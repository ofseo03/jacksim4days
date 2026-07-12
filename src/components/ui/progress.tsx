"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "accent",
}: {
  /** 0~1 */
  value: number;
  className?: string;
  tone?: "accent" | "success";
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn(
          "h-full rounded-full",
          tone === "accent" ? "bg-accent" : "bg-success"
        )}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
