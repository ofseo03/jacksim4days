"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
        "[transition-timing-function:var(--ease-apple)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        checked ? "bg-accent" : "bg-line"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md",
          "transition-transform duration-300 [transition-timing-function:var(--ease-apple)]",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}
