import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "accent"
  | "cyan"
  | "success"
  | "warning"
  | "danger"
  | "outline";

const variants: Record<Variant, string> = {
  default: "bg-surface-soft text-ink-soft",
  accent: "bg-accent/12 text-accent ring-1 ring-accent/25",
  cyan: "bg-cyan/12 text-cyan ring-1 ring-cyan/25",
  success: "bg-success/12 text-success ring-1 ring-success/25",
  warning: "bg-warning/14 text-warning ring-1 ring-warning/25",
  danger: "bg-danger/12 text-danger ring-1 ring-danger/25",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
