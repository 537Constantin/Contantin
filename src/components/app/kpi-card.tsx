import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/app/charts";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/data/analytics";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const positive = kpi.delta >= 0;
  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-300 [transition-timing-function:var(--ease-lux)] hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[var(--shadow-glow)]">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{kpi.label}</p>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
            positive ? "bg-success/12 text-success" : "bg-danger/12 text-danger",
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(kpi.delta).toFixed(1)}%
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{kpi.value}</p>
      <Sparkline data={kpi.spark} tone={kpi.tone} className="mt-3 h-9 w-full" />
    </div>
  );
}
