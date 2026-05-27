import type { Metadata } from "next";
import { Plus, Zap, GitBranch, Bot, Play, Pause, FileEdit, ArrowRight } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { workflows } from "@/lib/data/workflows";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import type { WorkflowStep, WorkflowStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Workflows" };

const stepMeta = {
  trigger: { icon: Zap, color: "var(--color-warning)" },
  action: { icon: Play, color: "var(--color-accent)" },
  condition: { icon: GitBranch, color: "var(--color-cyan)" },
  ai: { icon: Bot, color: "var(--color-violet)" },
} as const;

const statusMeta: Record<WorkflowStatus, { label: string; variant: "success" | "warning" | "default"; icon: typeof Play }> = {
  live: { label: "Live", variant: "success", icon: Play },
  paused: { label: "Pausiert", variant: "warning", icon: Pause },
  draft: { label: "Entwurf", variant: "default", icon: FileEdit },
};

export default function WorkflowsPage() {
  const live = workflows.filter((w) => w.status === "live").length;
  const totalRuns = workflows.reduce((s, w) => s + w.runs, 0);

  return (
    <PageShell>
      <PageHeader
        title="Workflows"
        description="Automatisiere Prozesse über Trigger, Bedingungen und KI-Schritte – wie Zapier, nur mit echten KI-Mitarbeitern."
      >
        <Button variant="accent" size="sm">
          <Plus className="h-4 w-4" /> Workflow erstellen
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Aktive Workflows" value={String(live)} />
        <Stat label="Ausführungen gesamt" value={formatNumber(totalRuns)} />
        <Stat label="Ø Erfolgsquote" value="97 %" />
      </div>

      <div className="mt-4 space-y-4">
        {workflows.map((wf) => {
          const sm = statusMeta[wf.status];
          const SIcon = sm.icon;
          return (
            <Card key={wf.id} hover>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display text-lg font-semibold text-ink">{wf.name}</h3>
                      <Badge variant={sm.variant}>
                        <SIcon className="h-3 w-3" /> {sm.label}
                      </Badge>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-muted">{wf.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-5 text-sm">
                    <div className="text-right">
                      <p className="font-semibold text-ink">{formatNumber(wf.runs)}</p>
                      <p className="text-xs text-muted">Runs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">{wf.successRate}%</p>
                      <p className="text-xs text-muted">Erfolg</p>
                    </div>
                    <Button variant="outline" size="sm">{wf.status === "live" ? "Bearbeiten" : "Aktivieren"}</Button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 overflow-x-auto rounded-xl border border-border bg-surface-soft/40 p-3">
                  {wf.steps.map((step, i) => (
                    <Step key={step.id} step={step} last={i === wf.steps.length - 1} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">Zuletzt aktualisiert {formatRelativeTime(wf.updatedAt)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}

function Step({ step, last }: { step: WorkflowStep; last: boolean }) {
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
      </CardContent>
    </Card>
  );
}
