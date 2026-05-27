import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("scroll-mt-24 py-20 sm:py-28 lg:py-32", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-gold",
        className,
      )}
    >
      <span className="h-px w-7 bg-gold/50" aria-hidden />
      {children}
    </span>
  );
}
