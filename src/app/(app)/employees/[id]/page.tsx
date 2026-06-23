import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MessageSquare, Settings2, Cpu, Wrench, Brain, Clock, Target, ShieldCheck, Zap, Gauge } from "lucide-react";
import { PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusDot } from "@/components/app/status";
import { ActivityFeed } from "@/components/app/activity-feed";
import { AgentCapabilities } from "@/components/agents/agent-capabilities";
import { getEmployee, employees, personalityMeta, autonomyMeta } from "@/lib/data/employees";
import { activity } from "@/lib/data/activity";
import { formatNumber } from "@/lib/utils";

export function generateStaticParams() {
  return employees.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const emp = getEmployee(id);
  return { title: emp ? `${emp.name} – ${emp.roleLabel}` : "Mitarbeiter" };
}

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = getEmployee(id);
  if (!emp) notFound();

  const feed = activity.filter((a) => a.employeeId === emp.id);
  const stats = [
    { label: "Erledigte Aufgaben", value: formatNumber(emp.tasksCompleted) },
    { label: "Offene Aufgaben", value: String(emp.tasksOpen) },
    { label: "Interaktionen", value: formatNumber(emp.interactions) },
    { label: "Eingesparte Stunden", value: `${emp.hoursSaved} h` },
  ];

  return (
    <PageShell>
      <Link href="/employees" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Alle Mitarbeiter
      </Link>

      <div className="mt-4 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={emp.name} color={emp.avatarColor} size="xl" glow />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{emp.name}</h1>
              <StatusDot status={emp.status} />
            </div>
            <p className="text-muted">{emp.roleLabel} · {personalityMeta[emp.personality]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4" /> Konfigurieren
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link href={`/chat?agent=${emp.id}`}>
              <MessageSquare className="h-4 w-4" /> Chatten
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Über {emp.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-ink-soft">{emp.description}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Brain className="h-4 w-4 text-accent" /> Fähigkeiten
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.map((s) => (
                      <Badge key={s} variant="accent">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Wrench className="h-4 w-4 text-cyan" /> Tools
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.tools.map((t) => (
                      <Badge key={t} variant="cyan">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auftrag & Verhalten</CardTitle>
              <Badge variant="accent">
                <Gauge className="h-3 w-3" />
                {autonomyMeta[emp.autonomy].label}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                  <Target className="h-4 w-4 text-accent" /> Auftrag
                </p>
                <p className="text-sm leading-relaxed text-ink-soft">{emp.objective}</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Verantwortungsbereiche</p>
                  <ul className="space-y-1.5 text-sm text-ink-soft">
                    {emp.responsibilities.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                    <ShieldCheck className="h-4 w-4 text-danger" /> Leitplanken
                  </p>
                  <ul className="space-y-1.5 text-sm text-ink-soft">
                    {emp.guardrails.map((g) => (
                      <li key={g} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-danger" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                  <Zap className="h-4 w-4 text-warning" /> Wird aktiv bei
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {emp.triggers.map((t) => (
                    <Badge key={t} variant="warning">{t}</Badge>
                  ))}
                </div>
              </div>

              <p className="rounded-xl border border-border bg-surface-soft/50 p-3 text-xs text-muted">
                {autonomyMeta[emp.autonomy].description}
              </p>
            </CardContent>
          </Card>

          <AgentCapabilities employee={emp} />

          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivität</CardTitle>
            </CardHeader>
            <CardContent>
              {feed.length ? (
                <ActivityFeed events={feed} />
              ) : (
                <p className="py-6 text-center text-sm text-muted">Noch keine Aktivität in diesem Zeitraum.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leistung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Gesamteffizienz</span>
                  <span className="font-semibold text-ink">{emp.performance}%</span>
                </div>
                <Progress value={emp.performance} tone="accent" className="mt-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Autonomie</span>
                  <span className="font-semibold text-ink">{Math.round(emp.performance * 0.86)}%</span>
                </div>
                <Progress value={emp.performance * 0.86} tone="cyan" className="mt-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Zufriedenheit</span>
                  <span className="font-semibold text-ink">{Math.round(emp.performance * 0.95)}%</span>
                </div>
                <Progress value={emp.performance * 0.95} tone="success" className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={<Cpu className="h-4 w-4" />} label="Modell" value={emp.model} mono />
              <Row icon={<Brain className="h-4 w-4" />} label="Persönlichkeit" value={personalityMeta[emp.personality]} />
              <Row icon={<Clock className="h-4 w-4" />} label="Erstellt" value={new Date(emp.createdAt).toLocaleDateString("de-DE")} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function Row({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-muted">{icon}{label}</span>
      <span className={mono ? "font-mono text-xs text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
