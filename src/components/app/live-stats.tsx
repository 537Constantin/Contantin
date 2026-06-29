"use client";

import * as React from "react";
import { Users, Play, Wand2, GraduationCap, type LucideIcon } from "lucide-react";
import { employees } from "@/lib/data/employees";
import { AnimatedCounter, SpotlightCard } from "@/components/motion/fx";
import { loadItems } from "@/lib/store-sync";
import type { UserWorkflow, WorkflowRun } from "@/lib/workflows-store";
import type { UserSpecialization } from "@/lib/data/specializations";

/** Real, per-user dashboard numbers (no fabricated metrics). */
export function LiveStats() {
  const [s, setS] = React.useState<{ runs: number; custom: number; specs: number } | null>(null);

  React.useEffect(() => {
    Promise.all([
      loadItems<WorkflowRun>("run"),
      loadItems<UserWorkflow>("workflow"),
      loadItems<UserSpecialization>("specialization"),
    ])
      .then(([runs, ws, sp]) =>
        setS({ runs: runs.length, custom: ws.length, specs: sp.filter((x) => x.activated).length }),
      )
      .catch(() => setS({ runs: 0, custom: 0, specs: 0 }));
  }, []);

  const items: { label: string; value: React.ReactNode; icon: LucideIcon; hint: string }[] = [
    { label: "KI-Mitarbeiter", value: employees.length, icon: Users, hint: "in deinem Team" },
    { label: "Workflow-Ausführungen", value: s?.runs ?? "—", icon: Play, hint: "gespeicherte Läufe" },
    { label: "Eigene Buttons", value: s?.custom ?? "—", icon: Wand2, hint: "selbst erstellt" },
    { label: "Aktive Spezialisierungen", value: s?.specs ?? "—", icon: GraduationCap, hint: "freigeschaltet" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((it) => (
        <SpotlightCard
          key={it.label}
          className="group rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-300 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--shadow-glow)]"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted">{it.label}</p>
            <it.icon className="h-4 w-4 text-muted transition-transform duration-300 [transition-timing-function:var(--ease-lux)] group-hover:scale-110" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            {typeof it.value === "number" ? <AnimatedCounter value={it.value} /> : it.value}
          </p>
          <p className="mt-1 text-xs text-muted">{it.hint}</p>
        </SpotlightCard>
      ))}
    </div>
  );
}
