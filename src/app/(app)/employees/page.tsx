"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, ArrowRight, Search, Trash2 } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { GlowAvatar } from "@/components/ui/glow-avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/app/status";
import { CreateEmployeeDialog } from "@/components/app/create-employee-dialog";
import { roleMeta } from "@/lib/data/employees";
import { personalityMeta } from "@/lib/data/employees";
import { useEmployees, isCustomEmployee } from "@/lib/data/user-employees";
import { formatNumber, cn } from "@/lib/utils";
import type { EmployeeRole } from "@/lib/types";

const filters: { key: EmployeeRole | "all"; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "secretary", label: "Sekretär" },
  { key: "consultant", label: "Berater" },
  { key: "support", label: "Support" },
  { key: "sales", label: "Vertrieb" },
  { key: "analyst", label: "Analyst" },
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
  const { all, add, remove } = useEmployees();
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<EmployeeRole | "all">("all");
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
  }, [params]);

  const list = all.filter((e) => {
    const matchRole = filter === "all" || e.role === filter;
    const matchQuery =
      !query ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.roleLabel.toLowerCase().includes(query.toLowerCase());
    return matchRole && matchQuery;
  });

  return (
    <PageShell>
      <PageHeader
        title="KI-Mitarbeiter"
        description="Erstelle und verwalte deine autonomen Agenten. Jeder hat eigenes Gedächtnis, eigene Tools und eigene Aufgaben."
      >
        <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Neuer Mitarbeiter
        </Button>
      </PageHeader>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.key ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative flex items-center sm:w-64">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mitarbeiter suchen…"
            className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((emp) => (
          <Link
            key={emp.id}
            href={`/employees/${emp.id}`}
            className="group relative flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-300 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1 hover:border-accent/30 hover:shadow-[var(--shadow-glow)]"
          >
            {isCustomEmployee(emp.id) && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(emp.id); }}
                className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-muted opacity-0 transition-opacity hover:bg-surface-soft hover:text-danger group-hover:opacity-100"
                aria-label={`${emp.name} löschen`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-start gap-3">
              <GlowAvatar name={emp.name} color={emp.avatarColor} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-semibold text-ink">{emp.name}</p>
                  <StatusDot status={emp.status} />
                  {isCustomEmployee(emp.id) && <Badge variant="accent">Eigener</Badge>}
                </div>
                <p className="text-sm text-muted">{emp.roleLabel}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{emp.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {emp.skills.slice(0, 3).map((s) => (
                <Badge key={s} variant="accent">{s}</Badge>
              ))}
              {emp.skills.length > 3 && <Badge variant="outline">+{emp.skills.length - 3}</Badge>}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Effizienz</span>
                <span className="font-medium text-ink">{emp.performance}%</span>
              </div>
              <Progress value={emp.performance} tone="accent" className="mt-1.5" />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-muted">
                <span className="font-semibold text-ink">{formatNumber(emp.tasksCompleted)}</span> erledigt
              </span>
              <span className="text-muted">
                <span className="font-semibold text-ink">{emp.hoursSaved} h</span> gespart
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Profil <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="mt-3 text-xs text-muted">{personalityMeta[emp.personality]}</span>
          </Link>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border text-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-soft">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium">Neuen KI-Mitarbeiter erstellen</span>
          <span className="max-w-[200px] text-center text-xs text-muted">
            Aus {Object.keys(roleMeta).length} Rollen wählen und in unter einer Minute live gehen
          </span>
        </button>
      </div>

      <CreateEmployeeDialog open={open} onClose={() => setOpen(false)} onCreated={add} />
    </PageShell>
  );
}
