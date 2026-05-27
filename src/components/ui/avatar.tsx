import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
} as const;

export function Avatar({
  name,
  color,
  size = "md",
  className,
  glow = false,
}: {
  name: string;
  color: string;
  size?: keyof typeof sizes;
  className?: string;
  glow?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #06070d))`,
        boxShadow: glow ? `0 0 0 3px color-mix(in srgb, ${color} 22%, transparent)` : undefined,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
