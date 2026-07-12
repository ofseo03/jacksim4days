import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  glass = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl transition-shadow duration-300",
        glass ? "glass" : "card-soft",
        className
      )}
      {...props}
    />
  );
}
