import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "accent",
}: {
  value: number;
  className?: string;
  tone?: "accent" | "cyan" | "success" | "warning" | "danger";
}) {
  const colors: Record<string, string> = {
    accent: "var(--color-accent)",
    cyan: "var(--color-cyan)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
  };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-soft", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 [transition-timing-function:var(--ease-lux)]"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: `linear-gradient(90deg, ${colors[tone]}, color-mix(in srgb, ${colors[tone]} 60%, var(--color-cyan)))`,
        }}
      />
    </div>
  );
}
