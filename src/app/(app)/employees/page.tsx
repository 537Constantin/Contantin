"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, ArrowUpRight, Search, Sparkles } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/app/status";
import { CreateEmployeeDialog } from "@/components/app/create-employee-dialog";
import { employees, roleMeta, personalityMeta, autonomyMeta } from "@/lib/data/employees";
import { formatNumber, cn } from "@/lib/utils";
import type { EmployeeRole } from "@/lib/types";

const filters: { key: EmployeeRole | "all"; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "secretary", label: "Executive Assistant" },
  { key: "consultant", label: "Berater" },
  { key: "support", label: "Support" },
  { key: "sales", label: "Vertrieb" },
  { key: "analyst", label: "Analyst" },
  { key: "accountant", label: "Buchhalter" },
  { key: "hr", label: "HR" },
  { key: "marketing", label: "Marketing" },
];

export default function EmployeesPage() {
  return (
    <React.Suspense>
      <EmployeesView />
    </React.Suspense>
  );
}

function EmployeesView() {
  const params = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<EmployeeRole | "all">("all");
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
  }, [params]);

  const list = employees.filter((e) => {
    const matchRole = filter === "all" || e.role === filter;
    const matchQuery =
      !query ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.roleLabel.toLowerCase().includes(query.toLowerCase());
    return matchRole && matchQuery;
  });

  const totals = React.useMemo(
    () => ({
      headcount: employees.length,
      active: employees.filter((e) => e.status === "active").length,
      hoursSaved: employees.reduce((s, e) => s + e.hoursSaved, 0),
      avgPerformance: Math.round(
        employees.reduce((s, e) => s + e.performance, 0) / employees.length,
      ),
      tasksCompleted: employees.reduce((s, e) => s + e.tasksCompleted, 0),
    }),
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Belegschaft"
        description="Dein digitales Team. Jeder Mitarbeiter hat einen klaren Auftrag, eigene Werkzeuge und einen Autonomiegrad — wie bei echten Angestellten."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/integrations">Integrationen</Link>
        </Button>
        <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Mitarbeiter einstellen
        </Button>
      </PageHeader>

      {/* Team-level KPIs — gives the page management gravity */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-border bg-border lg:grid-cols-4">
        <StatTile label="Im Team" value={`${totals.headcount}`} sub={`${totals.active} aktiv`} />
        <StatTile label="Aufgaben erledigt" value={formatNumber(totals.tasksCompleted)} sub="seit Start" />
        <StatTile label="Stunden gespart" value={`${totals.hoursSaved}`} sub="diesen Monat" />
        <StatTile label="Ø Performance" value={`${totals.avgPerformance}%`} sub="Gesamtteam" />
      </div>

      {/* Filter row */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-ink text-canvas"
                  : "bg-surface-soft text-ink-soft hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative flex items-center sm:w-72">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nach Name oder Rolle suchen…"
            className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
          />
        </label>
      </div>

      {/* Empty state when no match */}
      {list.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-surface-soft/40 px-6 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-canvas">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-ink">
            Niemand passt zu deiner Suche.
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Probier einen anderen Filter — oder stell einen neuen Mitarbeiter ein, der genau das macht, was du gerade suchst.
          </p>
          <Button variant="accent" size="sm" className="mt-5" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Mitarbeiter einstellen
          </Button>
        </div>
      )}

      {/* Employee grid */}
      {list.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((emp) => (
            <Link
              key={emp.id}
              href={`/employees/${emp.id}`}
              className="group relative flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-300 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1 hover:border-accent/30 hover:shadow-[var(--shadow-glow)]"
            >
              {/* Subtle role-color side bar */}
              <span
                aria-hidden
                className="absolute left-0 top-6 h-10 w-0.5 rounded-r-full"
                style={{ background: emp.avatarColor }}
              />

              {/* Header: avatar + identity + status */}
              <div className="flex items-start gap-3">
                <Avatar name={emp.name} color={emp.avatarColor} size="lg" glow />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-semibold tracking-tight text-ink">
                        {emp.name}
                      </p>
                      <p className="truncate text-xs text-muted">{emp.roleLabel}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <StatusDot status={emp.status} />
                    <span className="text-muted">·</span>
                    <span className="text-muted">{autonomyMeta[emp.autonomy].label}</span>
                  </div>
                </div>
              </div>

              {/* Objective excerpt — gives substance, not just description */}
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                {emp.objective}
              </p>

              {/* Top 3 skills as subtle pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {emp.skills.slice(0, 3).map((s) => (
                  <Badge key={s} variant="default">
                    {s}
                  </Badge>
                ))}
                {emp.skills.length > 3 && (
                  <Badge variant="outline">+{emp.skills.length - 3}</Badge>
                )}
              </div>

              {/* Performance bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Performance</span>
                  <span className="font-medium text-ink">{emp.performance}%</span>
                </div>
                <Progress value={emp.performance} tone="accent" className="mt-1.5" />
              </div>

              {/* Footer stats */}
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <Stat label="Erledigt" value={formatNumber(emp.tasksCompleted)} />
                <Stat label="Offen" value={String(emp.tasksOpen)} />
                <Stat label="Gespart" value={`${emp.hoursSaved}h`} />
              </dl>

              <p className="mt-4 text-[11px] uppercase tracking-wide text-muted">
                {personalityMeta[emp.personality]}
              </p>
            </Link>
          ))}

          {/* Hire-new tile, only on full view */}
          {filter === "all" && !query && (
            <button
              onClick={() => setOpen(true)}
              className="group flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border bg-surface-soft/30 text-muted transition-colors hover:border-accent/40 hover:bg-surface-soft/60 hover:text-accent"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-ink shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-110">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Neuen Mitarbeiter einstellen</span>
              <span className="max-w-[220px] text-center text-xs">
                Aus {Object.keys(roleMeta).length} Rollen wählen — in unter einer Minute live.
              </span>
            </button>
          )}
        </div>
      )}

      <CreateEmployeeDialog open={open} onClose={() => setOpen(false)} />
    </PageShell>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted">{sub}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-sm font-semibold text-ink">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
