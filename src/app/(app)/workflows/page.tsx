"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Zap, GitBranch, Bot, Play, Trash2, Save, ArrowRight, ArrowUp, ArrowDown,
  Sparkles, LayoutTemplate, Pause, FileEdit, Clock, MousePointerClick, Webhook,
  Loader2, History, CheckCircle2, AlertCircle, Mail,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { employees } from "@/lib/data/employees";
import { workflows as templates } from "@/lib/data/workflows";
import {
  stepTypeLabel, workflowToPrompt, triggerLabel, scheduleLabel, defaultTrigger,
  type UserWorkflow, type StepType, type WorkflowTrigger, type TriggerType,
  type Schedule, type WorkflowRun,
} from "@/lib/workflows-store";
import { loadItems, saveItems } from "@/lib/store-sync";
import type { WorkflowStep, WorkflowStatus } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const rid = () => Math.random().toString(36).slice(2, 9);
const triggerIcon: Record<TriggerType, typeof Clock> = {
  manual: MousePointerClick,
  schedule: Clock,
  event: Webhook,
};

const stepMeta: Record<StepType, { icon: typeof Zap; color: string }> = {
  trigger: { icon: Zap, color: "var(--color-warning)" },
  ai: { icon: Bot, color: "var(--color-violet)" },
  action: { icon: Play, color: "var(--color-accent)" },
  condition: { icon: GitBranch, color: "var(--color-cyan)" },
};

const statusMeta: Record<WorkflowStatus, { label: string; variant: "success" | "warning" | "default"; icon: typeof Play }> = {
  live: { label: "Aktiv", variant: "success", icon: Play },
  paused: { label: "Pausiert", variant: "warning", icon: Pause },
  draft: { label: "Entwurf", variant: "default", icon: FileEdit },
};

const stepOrder: StepType[] = ["trigger", "ai", "action", "condition"];

interface DraftStep extends WorkflowStep {}

// Stable IDs so the server-prerendered HTML and the client hydration match
// exactly (no random values during the initial render).
const starterSteps = (): DraftStep[] => [
  { id: "starter-1", type: "trigger", label: "Neue E-Mail im Postfach", detail: "Auslöser" },
  { id: "starter-2", type: "ai", label: "Inhalt zusammenfassen", detail: "KI extrahiert Kernpunkte" },
  { id: "starter-3", type: "action", label: "Zusammenfassung senden", detail: "Per E-Mail an dich" },
];

export default function WorkflowsPage() {
  const router = useRouter();

  // Builder state
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState(employees[0].id);
  const [steps, setSteps] = React.useState<DraftStep[]>(starterSteps);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [justSaved, setJustSaved] = React.useState(false);
  const [trigger, setTrigger] = React.useState<WorkflowTrigger>(defaultTrigger);
  const nameRef = React.useRef<HTMLInputElement>(null);

  // Saved workflows + run history
  const [saved, setSaved] = React.useState<UserWorkflow[]>([]);
  const [runs, setRuns] = React.useState<WorkflowRun[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      loadItems<UserWorkflow>("workflow"),
      loadItems<WorkflowRun>("run"),
    ]).then(([wf, rs]) => {
      setSaved(wf);
      setRuns(rs);
      setLoaded(true);
    });
  }, []);
  React.useEffect(() => {
    if (loaded) void saveItems("workflow", saved);
  }, [saved, loaded]);
  React.useEffect(() => {
    if (loaded) void saveItems("run", runs);
  }, [runs, loaded]);

  const addRun = (run: WorkflowRun) => setRuns((prev) => [run, ...prev].slice(0, 50));

  const validSteps = steps.filter((s) => s.label.trim());
  const employee = employees.find((e) => e.id === employeeId) ?? employees[0];

  const updateStep = (id: string, patch: Partial<DraftStep>) =>
    setSteps((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addStep = () =>
    setSteps((ss) => [...ss, { id: rid(), type: "action", label: "", detail: "" }]);
  const removeStep = (id: string) =>
    setSteps((ss) => (ss.length > 1 ? ss.filter((s) => s.id !== id) : ss));
  const moveStep = (id: string, dir: -1 | 1) =>
    setSteps((ss) => {
      const i = ss.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ss.length) return ss;
      const next = [...ss];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  function resetBuilder() {
    setName("");
    setDescription("");
    setEmployeeId(employees[0].id);
    setSteps(starterSteps());
    setTrigger(defaultTrigger());
    setEditingId(null);
    setError(null);
  }

  function save() {
    // Validate on click (instead of silently disabling the button) so it is
    // always clear *why* a workflow can't be saved yet.
    if (name.trim().length === 0) {
      setError("Bitte gib deinem Workflow zuerst oben einen Namen.");
      nameRef.current?.focus();
      return;
    }
    if (validSteps.length === 0) {
      setError("Füge mindestens einen Schritt mit einer Beschreibung hinzu.");
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const cleanSteps = validSteps.map((s) => ({
      id: s.id,
      type: s.type,
      label: s.label.trim(),
      detail: s.detail.trim() || stepTypeLabel[s.type],
    }));

    // An event trigger needs a secret token so its webhook URL can't be guessed.
    const finalTrigger: WorkflowTrigger =
      trigger.type === "event" && !trigger.token ? { ...trigger, token: rid() + rid() } : trigger;

    if (editingId) {
      setSaved((list) =>
        list.map((w) =>
          w.id === editingId
            ? { ...w, name: name.trim(), description: description.trim(), employeeId, steps: cleanSteps, trigger: finalTrigger, updatedAt: now }
            : w,
        ),
      );
    } else {
      const wf: UserWorkflow = {
        id: rid(),
        name: name.trim(),
        description: description.trim(),
        employeeId,
        status: "draft",
        steps: cleanSteps,
        trigger: finalTrigger,
        createdAt: now,
        updatedAt: now,
      };
      setSaved((list) => [wf, ...list]);
    }
    resetBuilder();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 4000);
  }

  function editWorkflow(wf: UserWorkflow) {
    setError(null);
    setJustSaved(false);
    setEditingId(wf.id);
    setName(wf.name);
    setDescription(wf.description);
    setEmployeeId(wf.employeeId);
    setSteps(wf.steps.map((s) => ({ ...s })));
    setTrigger(wf.trigger ?? defaultTrigger());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyTemplate(t: (typeof templates)[number]) {
    setError(null);
    setJustSaved(false);
    setEditingId(null);
    setName(t.name);
    setDescription(t.description);
    setEmployeeId(employees[0].id);
    setSteps(t.steps.map((s) => ({ ...s, id: rid() })));
    setTrigger(defaultTrigger());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const remove = (id: string) => {
    setSaved((list) => list.filter((w) => w.id !== id));
    if (editingId === id) resetBuilder();
  };

  const toggleStatus = (id: string) =>
    setSaved((list) =>
      list.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "live" ? "paused" : "live", updatedAt: new Date().toISOString() }
          : w,
      ),
    );

  function runInChat(wf: UserWorkflow) {
    const prompt = workflowToPrompt(wf);
    router.push(`/chat?agent=${encodeURIComponent(wf.employeeId)}&prompt=${encodeURIComponent(prompt)}`);
  }

  const [runningId, setRunningId] = React.useState<string | null>(null);
  async function runNow(wf: UserWorkflow) {
    setRunningId(wf.id);
    try {
      const res = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: wf }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; output?: string; emailSent?: boolean; error?: string }
        | null;
      const run: WorkflowRun = {
        id: rid(),
        workflowId: wf.id,
        workflowName: wf.name,
        status: data?.ok ? "success" : "error",
        triggeredBy: "manual",
        output: data?.ok ? data.output ?? "" : data?.error ?? "Ausführung fehlgeschlagen.",
        emailSent: data?.emailSent,
        createdAt: new Date().toISOString(),
      };
      addRun(run);
    } catch {
      addRun({
        id: rid(), workflowId: wf.id, workflowName: wf.name, status: "error",
        triggeredBy: "manual", output: "Netzwerkfehler – bitte erneut versuchen.",
        createdAt: new Date().toISOString(),
      });
    } finally {
      setRunningId(null);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Workflows"
        description="Baue Abläufe für deine KI-Mitarbeiter und lass sie wirklich ausführen – auf Knopfdruck, nach Zeitplan oder bei einem Ereignis."
      >
        {editingId && (
          <Button variant="ghost" size="sm" onClick={resetBuilder}>
            Neuen anlegen
          </Button>
        )}
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Builder */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Workflow bearbeiten" : "Neuer Workflow"}</CardTitle>
            {editingId && <Badge variant="accent">Bearbeitung</Badge>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Name <span className="text-danger">*</span>
              </label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="z. B. Posteingang automatisch sortieren"
                className={cn(
                  "h-11 w-full rounded-xl border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:bg-surface focus:outline-none",
                  error && !name.trim()
                    ? "border-danger focus:border-danger"
                    : "border-border focus:border-accent/40",
                )}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Ziel (optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Was soll dieser Workflow erreichen?"
                className="h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Zuständiger KI-Mitarbeiter</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {employees.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEmployeeId(e.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                      employeeId === e.id
                        ? "border-accent/60 bg-accent/8"
                        : "border-border hover:border-accent/30",
                    )}
                  >
                    <Avatar name={e.name} color={e.avatarColor} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{e.name}</p>
                      <p className="truncate text-[11px] text-muted">{e.roleLabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Schritte</label>
              <div className="space-y-2">
                {steps.map((s, i) => {
                  const Icon = stepMeta[s.type].icon;
                  return (
                    <div key={s.id} className="rounded-xl border border-border bg-surface-soft/40 p-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[11px] font-semibold"
                          style={{ background: `color-mix(in srgb, ${stepMeta[s.type].color} 16%, transparent)`, color: stepMeta[s.type].color }}
                        >
                          {i + 1}
                        </span>
                        <select
                          value={s.type}
                          onChange={(e) => updateStep(s.id, { type: e.target.value as StepType })}
                          className="h-9 rounded-lg border border-border bg-surface px-2 text-xs font-medium text-ink focus:border-accent/40 focus:outline-none"
                          aria-label="Schritt-Typ"
                        >
                          {stepOrder.map((t) => (
                            <option key={t} value={t}>{stepTypeLabel[t]}</option>
                          ))}
                        </select>
                        <Icon className="h-4 w-4 shrink-0" style={{ color: stepMeta[s.type].color }} />
                        <div className="ml-auto flex items-center">
                          <button onClick={() => moveStep(s.id, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface disabled:opacity-30" aria-label="nach oben">
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => moveStep(s.id, 1)} disabled={i === steps.length - 1} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface disabled:opacity-30" aria-label="nach unten">
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => removeStep(s.id)} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface hover:text-danger" aria-label="Schritt entfernen">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        value={s.label}
                        onChange={(e) => updateStep(s.id, { label: e.target.value })}
                        placeholder="Was passiert in diesem Schritt?"
                        className="mt-2 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
                      />
                      <input
                        value={s.detail}
                        onChange={(e) => updateStep(s.id, { detail: e.target.value })}
                        placeholder="Detail (optional)"
                        className="mt-1.5 h-8 w-full rounded-lg border border-border bg-surface px-3 text-xs text-ink-soft placeholder:text-muted focus:border-accent/40 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
              <button onClick={addStep} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                <Plus className="h-4 w-4" /> Schritt hinzufügen
              </button>
            </div>

            <TriggerEditor trigger={trigger} onChange={setTrigger} />

            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
            )}
            {justSaved && (
              <p className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
                Gespeichert ✓ – du findest den Workflow unten unter „Meine Workflows“.
              </p>
            )}
            <div className="flex justify-end gap-2">
              {editingId && (
                <Button variant="ghost" size="sm" onClick={resetBuilder}>Abbrechen</Button>
              )}
              <Button variant="accent" size="sm" onClick={save}>
                <Save className="h-4 w-4" /> {editingId ? "Änderungen speichern" : "Workflow speichern"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card>
          <CardHeader>
            <CardTitle>Vorschau</CardTitle>
            {validSteps.length > 0 && <Badge variant="outline">{validSteps.length} Schritte</Badge>}
          </CardHeader>
          <CardContent>
            {validSteps.length > 0 ? (
              <>
                <div className="flex items-center gap-2.5">
                  <Avatar name={employee.name} color={employee.avatarColor} size="sm" glow />
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">{name.trim() || "Unbenannter Workflow"}</p>
                    <p className="text-xs text-muted">{employee.name} · {employee.roleLabel}</p>
                  </div>
                </div>
                {description.trim() && <p className="mt-2 text-sm text-muted">{description}</p>}
                <div className="mt-4 space-y-2">
                  {validSteps.map((s, i) => (
                    <StepRow key={s.id} step={s} index={i} last={i === validSteps.length - 1} />
                  ))}
                </div>
              </>
            ) : (
              <p className="py-16 text-center text-sm text-muted">
                Gib dem Workflow einen Namen und mindestens einen Schritt, um die Vorschau zu sehen.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved workflows */}
      <div className="mt-8 flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Meine Workflows</h2>
        <Badge variant="default">{saved.length}</Badge>
      </div>

      {saved.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-12 text-center text-sm text-muted">
            Noch keine eigenen Workflows. Baue oben deinen ersten – oder starte mit einer Vorlage.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 space-y-4">
          {saved.map((wf) => {
            const emp = employees.find((e) => e.id === wf.employeeId) ?? employees[0];
            const sm = statusMeta[wf.status];
            const SIcon = sm.icon;
            return (
              <Card key={wf.id} hover>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={emp.name} color={emp.avatarColor} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-display text-lg font-semibold text-ink">{wf.name}</h3>
                          <Badge variant={sm.variant}><SIcon className="h-3 w-3" /> {sm.label}</Badge>
                        </div>
                        <p className="text-xs text-muted">{emp.name} · {emp.roleLabel}{wf.description ? ` · ${wf.description}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button variant="accent" size="sm" onClick={() => runNow(wf)} disabled={runningId === wf.id}>
                        {runningId === wf.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Jetzt ausführen
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => runInChat(wf)}>
                        <Sparkles className="h-4 w-4" /> Im Chat
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(wf.id)}>
                        {wf.status === "live" ? "Pausieren" : "Aktivieren"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => editWorkflow(wf)}>Bearbeiten</Button>
                      <button onClick={() => remove(wf.id)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-danger" aria-label="Workflow löschen">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <TriggerSummary wf={wf} />

                  <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto rounded-xl border border-border bg-surface-soft/40 p-3">
                    {wf.steps.map((step, i) => (
                      <ChainStep key={step.id} step={step} last={i === wf.steps.length - 1} />
                    ))}
                  </div>

                  <RunHistory runs={runs.filter((r) => r.workflowId === wf.id)} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Templates */}
      <div className="mt-8 flex items-center gap-2">
        <LayoutTemplate className="h-5 w-5 text-muted" />
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Vorlagen</h2>
      </div>
      <p className="mt-1 text-sm text-muted">Fertige Abläufe als Startpunkt – ein Klick lädt sie in den Builder.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.id} hover>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-ink">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted">{t.description}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" onClick={() => applyTemplate(t)}>
                  <Plus className="h-4 w-4" /> Verwenden
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto rounded-xl border border-border bg-surface-soft/40 p-3">
                {t.steps.map((step, i) => (
                  <ChainStep key={step.id} step={step} last={i === t.steps.length - 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

/** A vertical step row used in the live preview. */
function StepRow({ step, index, last }: { step: WorkflowStep; index: number; last: boolean }) {
  const { icon: Icon, color } = stepMeta[step.type];
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
          <Icon className="h-4 w-4" />
        </span>
        {!last && <span className="my-1 w-px flex-1 bg-border" />}
      </div>
      <div className={cn("min-w-0 pb-2", last && "pb-0")}>
        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color }}>
          {stepTypeLabel[step.type]} · Schritt {index + 1}
        </p>
        <p className="text-sm font-medium text-ink">{step.label}</p>
        {step.detail && <p className="text-xs text-muted">{step.detail}</p>}
      </div>
    </div>
  );
}

/** A horizontal chip used in the saved/template step chains. */
function ChainStep({ step, last }: { step: WorkflowStep; last: boolean }) {
  const { icon: Icon, color } = stepMeta[step.type];
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="whitespace-nowrap text-xs font-medium text-ink">{step.label}</p>
          <p className="whitespace-nowrap text-[11px] text-muted">{step.detail}</p>
        </div>
      </div>
      {!last && <ArrowRight className="h-4 w-4 shrink-0 text-muted" />}
    </div>
  );
}

const triggerTypes: TriggerType[] = ["manual", "schedule", "event"];
const schedules: Schedule[] = ["hourly", "daily", "weekly"];

/** Builder section: choose when/how the workflow runs. */
function TriggerEditor({ trigger, onChange }: { trigger: WorkflowTrigger; onChange: (t: WorkflowTrigger) => void }) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft/30 p-3">
      <label className="mb-2 block text-sm font-medium text-ink">Wann soll der Workflow laufen?</label>
      <div className="grid grid-cols-3 gap-2">
        {triggerTypes.map((t) => {
          const Icon = triggerIcon[t];
          return (
            <button
              key={t}
              onClick={() => onChange({ ...trigger, type: t })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center text-xs transition-all",
                trigger.type === t ? "border-accent/60 bg-accent/8 text-ink" : "border-border text-ink-soft hover:border-accent/30",
              )}
            >
              <Icon className="h-4 w-4" />
              {t === "manual" ? "Knopfdruck" : t === "schedule" ? "Zeitplan" : "Ereignis"}
            </button>
          );
        })}
      </div>

      {trigger.type === "schedule" && (
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-muted">Wie oft?</label>
          <select
            value={trigger.schedule ?? "daily"}
            onChange={(e) => onChange({ ...trigger, schedule: e.target.value as Schedule })}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-accent/40 focus:outline-none"
          >
            {schedules.map((s) => <option key={s} value={s}>{scheduleLabel[s]}</option>)}
          </select>
        </div>
      )}

      {trigger.type === "event" && (
        <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-muted">
          Dieser Workflow wird ausgelöst, wenn ein externer Dienst (z. B. eingehende E-Mail) ihn aufruft. Die persönliche Webhook-Adresse erscheint nach dem Speichern unten am Workflow.
        </p>
      )}

      <div className="mt-3">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
          <Mail className="h-3.5 w-3.5" /> Ergebnis per E-Mail an (optional)
        </label>
        <input
          value={trigger.notifyEmail ?? ""}
          onChange={(e) => onChange({ ...trigger, notifyEmail: e.target.value })}
          placeholder="name@firma.de"
          inputMode="email"
          className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
        />
      </div>
    </div>
  );
}

/** Small line on a saved workflow describing its trigger + webhook URL. */
function TriggerSummary({ wf }: { wf: UserWorkflow }) {
  const trigger = wf.trigger ?? { type: "manual" as TriggerType };
  const Icon = triggerIcon[trigger.type];
  const [copied, setCopied] = React.useState(false);

  const webhookUrl =
    trigger.type === "event" && trigger.token && typeof window !== "undefined"
      ? `${window.location.origin}/api/workflows/event`
      : "";

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-2.5 py-1 font-medium text-ink-soft">
          <Icon className="h-3.5 w-3.5" />
          {triggerLabel[trigger.type]}
          {trigger.type === "schedule" && trigger.schedule ? ` · ${scheduleLabel[trigger.schedule]}` : ""}
        </span>
        {trigger.notifyEmail && (
          <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {trigger.notifyEmail}</span>
        )}
      </div>

      {trigger.type === "event" && trigger.token && (
        <div className="rounded-lg border border-border bg-surface-soft/40 p-2.5 text-xs">
          <p className="mb-1 font-medium text-ink">Webhook – so löst ein externer Dienst diesen Workflow aus:</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-surface px-2 py-1 text-[11px] text-ink-soft">POST {webhookUrl}</code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(
                  JSON.stringify({ workflowId: wf.id, token: trigger.token, input: "<Inhalt, z. B. E-Mail-Text>" }, null, 2),
                );
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
              className="shrink-0 rounded-md border border-border px-2 py-1 font-medium text-accent hover:bg-surface"
            >
              {copied ? "Kopiert ✓" : "Daten kopieren"}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-muted">Body: workflowId + token + input (dein Auslöser-Inhalt).</p>
        </div>
      )}
    </div>
  );
}

/** Collapsible-ish list of recent runs for one workflow. */
function RunHistory({ runs }: { runs: WorkflowRun[] }) {
  const [open, setOpen] = React.useState(false);
  if (runs.length === 0) return null;
  const shown = open ? runs : runs.slice(0, 1);

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
        <History className="h-3.5 w-3.5" /> Verlauf ({runs.length}) {open ? "ausblenden" : "anzeigen"}
      </button>
      <div className="mt-2 space-y-2">
        {shown.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-surface-soft/30 p-2.5">
            <div className="flex items-center gap-2 text-xs">
              {r.status === "success"
                ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                : <AlertCircle className="h-3.5 w-3.5 text-danger" />}
              <span className="font-medium text-ink">{r.status === "success" ? "Erfolgreich" : "Fehler"}</span>
              <span className="text-muted">· {triggerLabel[r.triggeredBy]}</span>
              {r.emailSent && <span className="inline-flex items-center gap-1 text-muted"><Mail className="h-3 w-3" /> gesendet</span>}
              <span className="ml-auto text-muted">{formatRelativeTime(r.createdAt)}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">{r.output}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
