import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "gold" | "outline";

const variants: Record<Variant, string> = {
  default: "bg-surface-soft text-ink-soft",
  gold: "bg-gold/12 text-gold ring-1 ring-gold/25",
  outline: "border border-border text-muted",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
