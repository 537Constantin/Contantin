"use client";

import * as React from "react";
import {
  Play, Loader2, CheckCircle2, AlertCircle, Mail, History, Sparkles,
  Copy, Check, ChevronDown, Search, ArrowRight, Zap, Bot, GitBranch,
  Plus, Trash2, Wand2, X, GraduationCap, type LucideIcon,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowAvatar } from "@/components/ui/glow-avatar";
import { employees } from "@/lib/data/employees";
import { useEmployees, agentPersona } from "@/lib/data/user-employees";
import {
  workflowCatalog, catalogCategories,
  type WorkflowCategory,
} from "@/lib/data/workflow-catalog";
import { loadItems, saveItems } from "@/lib/store-sync";
import type { UserWorkflow, WorkflowRun } from "@/lib/workflows-store";
import { getSpecialization, buildExpertise, type UserSpecialization } from "@/lib/data/specializations";
import type { AIEmployee, WorkflowStep } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const rid = () => Math.random().toString(36).slice(2, 9);

const stepMeta: Record<WorkflowStep["type"], { icon: typeof Zap; color: string }> = {
  trigger: { icon: Zap, color: "var(--color-warning)" },
  ai: { icon: Bot, color: "var(--color-violet)" },
  action: { icon: Play, color: "var(--color-accent)" },
  condition: { icon: GitBranch, color: "var(--color-cyan)" },
};

/** A catalog entry to display + run — either a preset or a user-created button. */
interface DisplayWorkflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  employeeId: string;
  icon: LucideIcon;
  inputLabel: string;
  inputPlaceholder: string;
  deliverable: string;
  steps: WorkflowStep[];
  custom?: boolean;
  instruction?: string;
}

/** Map a saved user workflow to a catalog-style display entry. */
function toDisplay(w: UserWorkflow): DisplayWorkflow {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    category: (w.category as WorkflowCategory) ?? "Kommunikation",
    employeeId: w.employeeId,
    icon: Wand2,
    inputLabel: w.inputLabel ?? "Deine Eingabe",
    inputPlaceholder: w.inputPlaceholder ?? "Gib hier die Daten/Infos ein, mit denen gearbeitet werden soll …",
    deliverable: w.deliverable ?? "Fertiges Ergebnis",
    steps: w.steps,
    custom: true,
    instruction: w.instruction,
  };
}

export default function WorkflowsPage() {
  const { all: roster, find: findEmp } = useEmployees();
  const [runs, setRuns] = React.useState<WorkflowRun[]>([]);
  const [custom, setCustom] = React.useState<UserWorkflow[]>([]);
  const [specs, setSpecs] = React.useState<UserSpecialization[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [category, setCategory] = React.useState<WorkflowCategory | "all" | "custom">("all");
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    Promise.all([
      loadItems<WorkflowRun>("run"),
      loadItems<UserWorkflow>("workflow"),
      loadItems<UserSpecialization>("specialization"),
    ]).then(([rs, ws, sp]) => {
      setRuns(rs);
      setCustom(ws);
      setSpecs(sp);
      setLoaded(true);
    });
  }, []);

  /** An unlocked specialization assigned to this employee adds expertise. */
  function specForEmployee(employeeId: string) {
    const us = specs.find((u) => u.activated && u.assignedEmployeeId === employeeId);
    if (!us) return null;
    const spec = getSpecialization(us.id);
    return spec ? { spec, custom: us.customKnowledge ?? [] } : null;
  }
  React.useEffect(() => {
    if (loaded) void saveItems("run", runs);
  }, [runs, loaded]);
  React.useEffect(() => {
    if (loaded) void saveItems("workflow", custom);
  }, [custom, loaded]);

  const addRun = (run: WorkflowRun) => setRuns((prev) => [run, ...prev].slice(0, 60));

  async function runWorkflow(w: DisplayWorkflow, input: string, notifyEmail?: string): Promise<WorkflowRun> {
    const now = new Date().toISOString();
    const wf: UserWorkflow = {
      id: w.id,
      name: w.name,
      description: w.description,
      employeeId: w.employeeId,
      status: "live",
      steps: w.steps,
      instruction: w.instruction,
      trigger: notifyEmail ? { type: "manual", notifyEmail } : { type: "manual" },
      createdAt: now,
      updatedAt: now,
    };
    const sp = specForEmployee(w.employeeId);
    const expertise = sp ? buildExpertise(sp.spec, sp.custom) : undefined;
    const emp = findEmp(w.employeeId);
    const agent = emp ? agentPersona(emp) : undefined;
    let run: WorkflowRun;
    try {
      const res = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: wf, input, expertise, agent }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; output?: string; emailSent?: boolean; mode?: "live" | "demo"; error?: string }
        | null;
      run = {
        id: rid(),
        workflowId: w.id,
        workflowName: w.name,
        status: data?.ok ? "success" : "error",
        triggeredBy: "manual",
        input: input.slice(0, 4000),
        output: data?.ok ? data.output ?? "" : data?.error ?? "Ausführung fehlgeschlagen.",
        mode: data?.mode,
        emailSent: data?.emailSent,
        createdAt: new Date().toISOString(),
      };
    } catch {
      run = {
        id: rid(),
        workflowId: w.id,
        workflowName: w.name,
        status: "error",
        triggeredBy: "manual",
        input: input.slice(0, 4000),
        output: "Netzwerkfehler – bitte erneut versuchen.",
        createdAt: new Date().toISOString(),
      };
    }
    addRun(run);
    return run;
  }

  function createCustom(d: { name: string; employeeId: string; category: WorkflowCategory; instruction: string; inputLabel: string }) {
    const now = new Date().toISOString();
    const wf: UserWorkflow = {
      id: `cw-${rid()}`,
      name: d.name.trim(),
      description: d.instruction.trim().slice(0, 140),
      employeeId: d.employeeId,
      category: d.category,
      instruction: d.instruction.trim(),
      inputLabel: d.inputLabel.trim() || "Deine Eingabe",
      inputPlaceholder: "Gib hier die Daten/Infos ein, mit denen gearbeitet werden soll …",
      deliverable: "Fertiges Ergebnis",
      status: "live",
      steps: [
        { id: "s1", type: "ai", label: "Auftrag verstehen", detail: "Eingabe & Ziel erfassen" },
        { id: "s2", type: "ai", label: "Umsetzen", detail: d.name.trim() },
        { id: "s3", type: "action", label: "Ergebnis liefern", detail: "Fertig zum Verwenden" },
      ],
      trigger: { type: "manual" },
      createdAt: now,
      updatedAt: now,
    };
    setCustom((prev) => [wf, ...prev]);
    setCreating(false);
    setCategory("custom");
  }

  function deleteCustom(id: string) {
    setCustom((prev) => prev.filter((w) => w.id !== id));
    setRuns((prev) => prev.filter((r) => r.workflowId !== id));
  }

  const all: DisplayWorkflow[] = [
    ...custom.map(toDisplay),
    ...workflowCatalog.map((cw) => ({ ...cw, custom: false }) as DisplayWorkflow),
  ];
  const list = all.filter((w) => {
    const matchCat = category === "all" ? true : category === "custom" ? w.custom : w.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <PageShell>
      <PageHeader
        title="Workflows"
        description="Fertige KI-Abläufe: Daten rein, fertiges Ergebnis raus. Nutze eine Vorlage – oder erstelle einen eigenen Button für deinen KI-Mitarbeiter."
      />

      {/* Honesty note */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-surface-soft/40 p-3.5 text-sm text-ink-soft">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          <span className="font-medium text-ink">So funktionieren Workflows:</span> Die KI erstellt dir das fertige
          Ergebnis (z. B. den Antwort-Entwurf) – du prüfst es und verwendest es. Mit{" "}
          <span className="font-medium text-ink">Eigener Button</span> erweiterst du den Katalog um deine eigenen
          Abläufe. Echte Aktionen in anderen Konten (z. B. wirklich versenden) kommen als nächste Ausbaustufe.
        </p>
      </div>

      {/* Filter + search + create */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>Alle</FilterChip>
          {custom.length > 0 && (
            <FilterChip active={category === "custom"} onClick={() => setCategory("custom")}>
              <Wand2 className="h-3.5 w-3.5" /> Eigene ({custom.length})
            </FilterChip>
          )}
          {catalogCategories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterChip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="relative flex flex-1 items-center sm:w-56">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Workflow suchen…"
              className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
            />
          </label>
          <Button variant="accent" size="sm" className="shrink-0" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Eigener Button
          </Button>
        </div>
      </div>

      {/* Creator */}
      {creating && (
        <div className="mt-4">
          <WorkflowCreator roster={roster} onCreate={createCustom} onCancel={() => setCreating(false)} />
        </div>
      )}

      {/* Catalog (presets + custom) */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((w) => (
          <WorkflowCard
            key={w.id}
            workflow={w}
            employee={findEmp(w.employeeId) ?? roster[0]}
            runs={runs.filter((r) => r.workflowId === w.id)}
            onRun={runWorkflow}
            onDelete={w.custom ? () => deleteCustom(w.id) : undefined}
            specName={specForEmployee(w.employeeId)?.spec.name}
          />
        ))}
      </div>

      {list.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-12 text-center text-sm text-muted">
            {category === "custom"
              ? "Noch keine eigenen Buttons. Erstelle deinen ersten mit 'Eigener Button' oben rechts."
              : "Kein Workflow gefunden. Versuch eine andere Kategorie oder Suche."}
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function WorkflowCreator({
  roster,
  onCreate,
  onCancel,
}: {
  roster: AIEmployee[];
  onCreate: (d: { name: string; employeeId: string; category: WorkflowCategory; instruction: string; inputLabel: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState(employees[0].id);
  const [category, setCategory] = React.useState<WorkflowCategory>("Kommunikation");
  const [instruction, setInstruction] = React.useState("");
  const [inputLabel, setInputLabel] = React.useState("");
  const valid = name.trim().length > 1 && instruction.trim().length > 4;

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent"><Wand2 className="h-4 w-4" /></span>
            <h3 className="font-display text-base font-semibold text-ink">Eigenen Button erstellen</h3>
          </div>
          <button onClick={onCancel} className="rounded-md p-1 text-muted hover:bg-surface-soft hover:text-ink" aria-label="Schließen">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted">
          Lege einen neuen Workflow-Button für den Katalog an: Name, zuständiger KI-Mitarbeiter und – mit eigenen Worten –
          was er tun soll. Der Button erscheint danach im Katalog und ist beliebig oft ausführbar.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Name des Buttons</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Produktbeschreibung schreiben"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Zuständiger KI-Mitarbeiter</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-ink focus:border-accent/40 focus:outline-none"
            >
              {roster.map((e) => (
                <option key={e.id} value={e.id}>{e.name} · {e.roleLabel}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Kategorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WorkflowCategory)}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-ink focus:border-accent/40 focus:outline-none"
            >
              {catalogCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Eingabe-Hinweis (optional)</label>
            <input
              value={inputLabel}
              onChange={(e) => setInputLabel(e.target.value)}
              placeholder="z. B. Eckdaten zum Produkt"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Was soll der Mitarbeiter tun?</label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Beschreibe die Aufgabe mit eigenen Worten – z. B.: Schreibe aus meinen Eckdaten eine überzeugende Produktbeschreibung mit Überschrift, 3 Vorteilen und einem Call-to-Action."
            rows={4}
            className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="accent"
            size="sm"
            disabled={!valid}
            onClick={() => onCreate({ name, employeeId, category, instruction, inputLabel })}
          >
            <Plus className="h-4 w-4" /> Button erstellen
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>Abbrechen</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowCard({
  workflow: w,
  employee: emp,
  runs,
  onRun,
  onDelete,
  specName,
}: {
  workflow: DisplayWorkflow;
  employee: AIEmployee;
  runs: WorkflowRun[];
  onRun: (w: DisplayWorkflow, input: string, notifyEmail?: string) => Promise<WorkflowRun>;
  onDelete?: () => void;
  specName?: string;
}) {
  const Icon = w.icon;
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const latest = runs[0];

  async function handleRun() {
    if (!input.trim()) {
      setError(`Bitte zuerst ${w.inputLabel.toLowerCase()} eingeben.`);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setRunning(true);
    try {
      await onRun(w, input.trim(), email.trim() || undefined);
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card hover>
      <CardContent className="flex h-full flex-col p-5">
        {/* Head */}
        <div className="flex items-start gap-3">
          <span className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
            w.custom ? "border-accent/30 bg-accent/10 text-accent" : "border-border bg-surface-soft/60 text-ink",
          )}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-ink">{w.name}</h3>
              {w.custom && <Badge variant="accent">Eigener</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-muted">{w.description}</p>
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="shrink-0 rounded-md p-1.5 text-muted hover:bg-surface-soft hover:text-danger"
              aria-label="Eigenen Button löschen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Who runs it */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <GlowAvatar name={emp.name} color={emp.avatarColor} size="sm" />
          <span className="text-xs text-muted">{emp.name} · {emp.roleLabel}</span>
          {specName && (
            <Badge variant="accent"><GraduationCap className="h-3 w-3" /> {specName}</Badge>
          )}
          <Badge variant="outline" className="ml-auto">{w.category}</Badge>
        </div>

        {/* In / Out */}
        <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-border bg-surface-soft/40 p-3 text-xs sm:grid-cols-2">
          <div>
            <p className="font-medium text-muted">Du gibst</p>
            <p className="text-ink-soft">{w.inputLabel}</p>
          </div>
          <div>
            <p className="font-medium text-muted">Du bekommst</p>
            <p className="text-ink-soft">{w.deliverable}</p>
          </div>
        </div>

        {/* Step chain */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {w.steps.map((s, i) => (
            <ChainStep key={s.id} step={s} last={i === w.steps.length - 1} />
          ))}
        </div>

        {/* Run toggle */}
        <div className="mt-4">
          <Button variant={open ? "outline" : "accent"} size="sm" onClick={() => setOpen((v) => !v)}>
            <Play className="h-4 w-4" /> {open ? "Schließen" : "Ausführen"}
          </Button>
        </div>

        {/* Run panel */}
        {open && (
          <div className="mt-3 space-y-3 rounded-xl border border-border bg-surface-soft/30 p-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">{w.inputLabel}</label>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); if (error) setError(null); }}
                placeholder={w.inputPlaceholder}
                rows={5}
                className={cn(
                  "w-full resize-y rounded-xl border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none",
                  error ? "border-danger focus:border-danger" : "border-border focus:border-accent/40",
                )}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <Mail className="h-3.5 w-3.5" /> Ergebnis per E-Mail an mich (optional)
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@firma.de"
                inputMode="email"
                className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
              />
            </div>
            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
            <Button variant="accent" size="sm" onClick={handleRun} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {running ? "Wird ausgeführt…" : "Jetzt ausführen"}
            </Button>
          </div>
        )}

        {/* Latest result */}
        {latest && <ResultBlock run={latest} />}

        {/* Earlier results */}
        {runs.length > 1 && <RunHistory runs={runs.slice(1)} />}
      </CardContent>
    </Card>
  );
}

function ChainStep({ step, last }: { step: WorkflowStep; last: boolean }) {
  const { icon: Icon, color } = stepMeta[step.type];
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="grid h-7 w-7 place-items-center rounded-md"
        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
        title={`${step.label} – ${step.detail}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      {!last && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />}
    </div>
  );
}

function ResultBlock({ run }: { run: WorkflowRun }) {
  const [copied, setCopied] = React.useState(false);
  const ok = run.status === "success";
  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        {ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-danger" />}
        <span className="font-medium text-ink">{ok ? "Ergebnis" : "Fehler"}</span>
        {run.mode === "demo" && <Badge variant="warning">Demo</Badge>}
        {run.mode === "live" && <Badge variant="success">Echt</Badge>}
        {run.emailSent && <span className="inline-flex items-center gap-1 text-muted"><Mail className="h-3 w-3" /> gesendet</span>}
        <span className="text-muted">{formatRelativeTime(run.createdAt)}</span>
        {ok && run.output && (
          <button
            onClick={() => {
              navigator.clipboard?.writeText(run.output);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-medium text-accent hover:bg-surface-soft"
          >
            {copied ? <><Check className="h-3 w-3" /> Kopiert</> : <><Copy className="h-3 w-3" /> Kopieren</>}
          </button>
        )}
      </div>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">{run.output}</p>
    </div>
  );
}

function RunHistory({ runs }: { runs: WorkflowRun[] }) {
  const [open, setOpen] = React.useState(false);
  if (runs.length === 0) return null;
  return (
    <div className="mt-3 border-t border-border pt-3">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
        <History className="h-3.5 w-3.5" /> Frühere Ergebnisse ({runs.length}) {open ? "ausblenden" : "anzeigen"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 space-y-2">
          {runs.map((r) => <ResultBlock key={r.id} run={r} />)}
        </div>
      )}
    </div>
  );
}
