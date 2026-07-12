import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "success" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-surface text-muted",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
