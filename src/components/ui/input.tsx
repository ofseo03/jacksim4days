"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-line bg-card px-4 text-[15px]",
          "placeholder:text-faint",
          "transition-all duration-300 [transition-timing-function:var(--ease-apple)]",
          "focus:border-accent focus:ring-4 focus:ring-accent-soft focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
