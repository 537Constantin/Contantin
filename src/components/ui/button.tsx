import * as React from "react";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-ink/90 shadow-[var(--shadow-soft)]",
  accent:
    "bg-ink text-canvas shadow-[var(--shadow-soft)] hover:bg-ink/90 hover:shadow-[var(--shadow-glow)]",
  outline:
    "border border-border bg-surface/40 text-ink hover:bg-surface-soft hover:border-accent/40",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-soft hover:text-ink",
  subtle: "bg-surface-soft text-ink hover:bg-border/60",
  danger: "bg-danger/15 text-danger ring-1 ring-danger/30 hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10",
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
          "transition-[transform,background-color,filter,box-shadow,border-color] duration-300 [transition-timing-function:var(--ease-lux)]",
          "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
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
