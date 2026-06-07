"use client";

import * as React from "react";
import {
  Play, Loader2, CheckCircle2, AlertCircle, Mail, History, Sparkles,
  Copy, Check, ChevronDown, Search, ArrowRight, Zap, Bot, GitBranch,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowAvatar } from "@/components/ui/glow-avatar";
import { employees, getEmployee } from "@/lib/data/employees";
import {
  workflowCatalog, catalogCategories,
  type CatalogWorkflow, type WorkflowCategory,
} from "@/lib/data/workflow-catalog";
import { loadItems, saveItems } from "@/lib/store-sync";
import type { UserWorkflow, WorkflowRun } from "@/lib/workflows-store";
import type { WorkflowStep } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const rid = () => Math.random().toString(36).slice(2, 9);

const stepMeta: Record<WorkflowStep["type"], { icon: typeof Zap; color: string }> = {
  trigger: { icon: Zap, color: "var(--color-warning)" },
  ai: { icon: Bot, color: "var(--color-violet)" },
  action: { icon: Play, color: "var(--color-accent)" },
  condition: { icon: GitBranch, color: "var(--color-cyan)" },
};

export default function WorkflowsPage() {
  const [runs, setRuns] = React.useState<WorkflowRun[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [category, setCategory] = React.useState<WorkflowCategory | "all">("all");
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    loadItems<WorkflowRun>("run").then((rs) => {
      setRuns(rs);
      setLoaded(true);
    });
  }, []);
  React.useEffect(() => {
    if (loaded) void saveItems("run", runs);
  }, [runs, loaded]);

  const addRun = (run: WorkflowRun) => setRuns((prev) => [run, ...prev].slice(0, 60));

  async function runWorkflow(cw: CatalogWorkflow, input: string, notifyEmail?: string): Promise<WorkflowRun> {
    const now = new Date().toISOString();
    const wf: UserWorkflow = {
      id: cw.id,
      name: cw.name,
      description: cw.description,
      employeeId: cw.employeeId,
      status: "live",
      steps: cw.steps,
      trigger: notifyEmail ? { type: "manual", notifyEmail } : { type: "manual" },
      createdAt: now,
      updatedAt: now,
    };
    let run: WorkflowRun;
    try {
      const res = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: wf, input }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; output?: string; emailSent?: boolean; mode?: "live" | "demo"; error?: string }
        | null;
      run = {
        id: rid(),
        workflowId: cw.id,
        workflowName: cw.name,
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
        workflowId: cw.id,
        workflowName: cw.name,
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

  const list = workflowCatalog.filter((w) => {
    const matchCat = category === "all" || w.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <PageShell>
      <PageHeader
        title="Workflows"
        description="Fertige KI-Abläufe: Daten rein, fertiges Ergebnis raus. Wähle einen Ablauf, gib deine Daten ein – die KI erledigt den Rest."
      />

      {/* Honesty note: what a workflow really does */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-surface-soft/40 p-3.5 text-sm text-ink-soft">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          <span className="font-medium text-ink">So funktionieren Workflows:</span> Die KI erstellt dir das fertige
          Ergebnis (z. B. den Antwort-Entwurf) – du prüfst es und verwendest es. Echte Aktionen in anderen Konten
          (z. B. wirklich versenden oder posten) kommen als nächste Ausbaustufe.
        </p>
      </div>

      {/* Category filter + search */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>Alle</FilterChip>
          {catalogCategories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterChip>
          ))}
        </div>
        <label className="relative flex items-center sm:w-64">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Workflow suchen…"
            className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
          />
        </label>
      </div>

      {/* Catalog */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((cw) => (
          <WorkflowCard
            key={cw.id}
            workflow={cw}
            runs={runs.filter((r) => r.workflowId === cw.id)}
            onRun={runWorkflow}
          />
        ))}
      </div>

      {list.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-12 text-center text-sm text-muted">
            Kein Workflow gefunden. Versuch eine andere Kategorie oder Suche.
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
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function WorkflowCard({
  workflow: cw,
  runs,
  onRun,
}: {
  workflow: CatalogWorkflow;
  runs: WorkflowRun[];
  onRun: (cw: CatalogWorkflow, input: string, notifyEmail?: string) => Promise<WorkflowRun>;
}) {
  const emp = getEmployee(cw.employeeId) ?? employees[0];
  const Icon = cw.icon;
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const latest = runs[0];

  async function handleRun() {
    if (!input.trim()) {
      setError(`Bitte zuerst ${cw.inputLabel.toLowerCase()} eingeben.`);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setRunning(true);
    try {
      await onRun(cw, input.trim(), email.trim() || undefined);
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card hover>
      <CardContent className="flex h-full flex-col p-5">
        {/* Head */}
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-surface-soft/60">
            <Icon className="h-5 w-5 text-ink" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-semibold text-ink">{cw.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{cw.description}</p>
          </div>
        </div>

        {/* Who runs it */}
        <div className="mt-3 flex items-center gap-2">
          <GlowAvatar name={emp.name} color={emp.avatarColor} size="sm" />
          <span className="text-xs text-muted">{emp.name} · {emp.roleLabel}</span>
          <Badge variant="outline" className="ml-auto">{cw.category}</Badge>
        </div>

        {/* In / Out */}
        <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-border bg-surface-soft/40 p-3 text-xs sm:grid-cols-2">
          <div>
            <p className="font-medium text-muted">Du gibst</p>
            <p className="text-ink-soft">{cw.inputLabel}</p>
          </div>
          <div>
            <p className="font-medium text-muted">Du bekommst</p>
            <p className="text-ink-soft">{cw.deliverable}</p>
          </div>
        </div>

        {/* Step chain */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {cw.steps.map((s, i) => (
            <ChainStep key={s.id} step={s} last={i === cw.steps.length - 1} />
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
              <label className="mb-1.5 block text-sm font-medium text-ink">{cw.inputLabel}</label>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); if (error) setError(null); }}
                placeholder={cw.inputPlaceholder}
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
