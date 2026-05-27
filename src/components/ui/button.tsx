import * as React from "react";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-ink/90 shadow-[var(--shadow-soft)]",
  gold: "bg-gold text-white hover:brightness-105 shadow-[var(--shadow-soft)]",
  outline:
    "border border-border bg-transparent text-ink hover:bg-surface-soft",
  ghost: "bg-transparent text-ink hover:bg-surface-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight",
          "transition-[transform,background-color,filter,box-shadow] duration-300 [transition-timing-function:var(--ease-lux)]",
          "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
