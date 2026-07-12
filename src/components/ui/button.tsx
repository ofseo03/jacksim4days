"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 shadow-[var(--shadow-soft)]",
  accent:
    "bg-accent text-white hover:bg-accent-strong shadow-[0_8px_24px_var(--accent-soft)]",
  secondary: "bg-surface text-foreground hover:bg-line",
  outline: "border border-line bg-transparent text-foreground hover:bg-surface",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface",
  danger: "bg-transparent text-red-500 hover:bg-red-500/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-6 text-[15px] rounded-full",
  lg: "h-14 px-9 text-base rounded-full",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold select-none",
        "transition-all duration-300 [transition-timing-function:var(--ease-apple)]",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-40 disabled:pointer-events-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
