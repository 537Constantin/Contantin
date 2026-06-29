"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, ChevronDown, Check, Zap, ArrowRight, ListChecks } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { GlowAvatar } from "@/components/ui/glow-avatar";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/app/status";
import { CreateEmployeeDialog } from "@/components/app/create-employee-dialog";
import { TaskSetupDialog } from "@/components/app/task-setup-dialog";
import { SpotlightCard } from "@/components/motion/fx";
import { employees } from "@/lib/data/employees";
import { tasksForEmployee, type EmployeeTask, type UserTask } from "@/lib/data/tasks";
import { loadItems, saveItems } from "@/lib/store-sync";
import { cn } from "@/lib/utils";
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
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<EmployeeRole | "all">("all");
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [activeTask, setActiveTask] = React.useState<EmployeeTask | null>(null);

  // Per-user task state (configured / automated / values), synced to DB + localStorage.
  const [userTasks, setUserTasks] = React.useState<UserTask[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    loadItems<UserTask>("task").then((t) => {
      setUserTasks(t);
      setLoaded(true);
    });
  }, []);
  React.useEffect(() => {
    if (loaded) void saveItems("task", userTasks);
  }, [userTasks, loaded]);

  React.useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
  }, [params]);

  function patchUserTask(taskId: string, patch: Partial<UserTask>) {
    setUserTasks((list) => {
      const existing = list.find((u) => u.id === taskId);
      const base: UserTask = existing ?? { id: taskId, configured: false, values: {}, automated: false, updatedAt: "" };
      const updated: UserTask = { ...base, ...patch, updatedAt: new Date().toISOString() };
      return existing ? list.map((u) => (u.id === taskId ? updated : u)) : [...list, updated];
    });
  }

  const list = employees.filter((e) => {
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
        description="Klapp einen Mitarbeiter auf, um seine Aufgaben zu sehen. Jede Aufgabe lässt sich einrichten und danach automatisieren."
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

      <div className="mt-5 space-y-3">
        {list.map((emp) => {
          const empTasks = tasksForEmployee(emp.id);
          const isOpen = expanded === emp.id;
          const configuredCount = empTasks.filter(
            (t) => userTasks.find((u) => u.id === t.id)?.configured,
          ).length;

          return (
            <SpotlightCard
              key={emp.id}
              ring
              className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-shadow duration-300 [transition-timing-function:var(--ease-lux)] hover:shadow-[var(--shadow-glow)]"
            >
              {/* Employee header row (toggle) */}
              <button
                onClick={() => setExpanded(isOpen ? null : emp.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-soft/40"
                aria-expanded={isOpen}
              >
                <GlowAvatar name={emp.name} color={emp.avatarColor} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <p className="font-display text-lg font-semibold text-ink">{emp.name}</p>
                    <StatusDot status={emp.status} />
                  </div>
                  <p className="truncate text-sm text-muted">{emp.roleLabel}</p>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <Badge variant="outline">
                    <ListChecks className="h-3.5 w-3.5" /> {empTasks.length} Aufgaben
                  </Badge>
                  {configuredCount > 0 && (
                    <Badge variant="success"><Check className="h-3 w-3" /> {configuredCount} aktiv</Badge>
                  )}
                </div>

                <ChevronDown
                  className={cn("h-5 w-5 shrink-0 text-muted transition-transform", isOpen && "rotate-180")}
                />
              </button>

              {/* Expanded: nur die Aufgaben */}
              {isOpen && (
                <div className="border-t border-border bg-surface-soft/20 px-3 py-3 sm:px-4">
                  {empTasks.length === 0 ? (
                    <p className="px-1.5 py-4 text-sm text-muted">
                      Für {emp.name} sind noch keine Aufgaben hinterlegt.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {empTasks.map((task) => {
                        const ut = userTasks.find((u) => u.id === task.id);
                        return (
                          <li key={task.id}>
                            <button
                              onClick={() => setActiveTask(task)}
                              className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-all hover:border-accent/30 hover:shadow-[var(--shadow-soft)]"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium text-ink">{task.title}</p>
                                  {ut?.configured && (
                                    <Badge variant="success"><Check className="h-3 w-3" /> Eingerichtet</Badge>
                                  )}
                                  {ut?.automated && (
                                    <Badge variant="accent"><Zap className="h-3 w-3" /> Automatisiert</Badge>
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-sm text-muted">{task.description}</p>
                              </div>
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                                {ut?.configured ? "Verwalten" : "Einrichten"}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </SpotlightCard>
          );
        })}

        {list.length === 0 && (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border py-10 text-center text-sm text-muted">
            Kein Mitarbeiter gefunden.
          </p>
        )}
      </div>

      <CreateEmployeeDialog open={open} onClose={() => setOpen(false)} />
      <TaskSetupDialog
        task={activeTask}
        userTask={activeTask ? userTasks.find((u) => u.id === activeTask.id) : undefined}
        onClose={() => setActiveTask(null)}
        onSave={patchUserTask}
      />
    </PageShell>
  );
}
