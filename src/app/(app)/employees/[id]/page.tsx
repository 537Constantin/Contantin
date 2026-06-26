import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  MessageSquare,
  Settings2,
  Cpu,
  Brain,
  Clock,
  Target,
  ShieldCheck,
  Zap,
  Gauge,
  Sparkles,
  CheckCircle2,
  CircleDot,
  CircleSlash,
  TrendingUp,
  Mail,
  Hash,
} from "lucide-react";
import { PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusDot } from "@/components/app/status";
import { ActivityFeed } from "@/components/app/activity-feed";
import { AgentCapabilities } from "@/components/agents/agent-capabilities";
import {
  getEmployee,
  employees,
  personalityMeta,
  autonomyMeta,
  roleMeta,
} from "@/lib/data/employees";
import { activity, tasks } from "@/lib/data/activity";
import { formatNumber } from "@/lib/utils";

export function generateStaticParams() {
  return employees.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const emp = getEmployee(id);
  return { title: emp ? `${emp.name} – ${emp.roleLabel}` : "Mitarbeiter" };
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const emp = getEmployee(id);
  if (!emp) notFound();

  const feed = activity.filter((a) => a.employeeId === emp.id);
  const myTasks = tasks.filter((t) => t.employeeId === emp.id);
  const openTasks = myTasks.filter((t) => t.state !== "done");
  const doneToday = myTasks.filter((t) => t.state === "done");
  const successRate = Math.round((emp.tasksCompleted / Math.max(1, emp.tasksCompleted + emp.tasksOpen)) * 100);

  // Pick teammates relevant for hand-offs (everyone else)
  const teammates = employees.filter((e) => e.id !== emp.id).slice(0, 5);

  return (
    <PageShell>
      {/* Top-left breadcrumb */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Belegschaft
      </Link>

      {/* HERO — large, editorial, with role-color accent stripe */}
      <section className="relative mt-4 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${emp.avatarColor}, transparent)`,
          }}
        />
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <Avatar name={emp.name} color={emp.avatarColor} size="xl" glow />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {emp.name}
                </h1>
                <StatusDot status={emp.status} />
              </div>
              <p className="mt-1 text-muted">
                {emp.roleLabel} · {personalityMeta[emp.personality]} ·{" "}
                <span className="text-ink">{autonomyMeta[emp.autonomy].label}</span>
              </p>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                {emp.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4" /> Konfigurieren
            </Button>
            <Button variant="accent" size="sm" asChild>
              <Link href={`/chat?agent=${emp.id}`}>
                <MessageSquare className="h-4 w-4" /> Mit {emp.name} sprechen
              </Link>
            </Button>
          </div>
        </div>

        {/* Inline KPI strip */}
        <dl className="grid grid-cols-2 gap-px border-t border-border bg-border md:grid-cols-4">
          <KpiCell label="Erledigt gesamt" value={formatNumber(emp.tasksCompleted)} />
          <KpiCell label="Offene Aufgaben" value={String(emp.tasksOpen)} />
          <KpiCell label="Erfolgsquote" value={`${successRate}%`} />
          <KpiCell label="Stunden gespart" value={`${emp.hoursSaved} h`} />
        </dl>
      </section>

      {/* Two-column body */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* LEFT MAIN */}
        <div className="space-y-6 min-w-0">
          {/* Today — what the agent has already done */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <CardTitle>Heute schon erledigt</CardTitle>
              </div>
              <Badge variant="default">Stand jetzt</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {emp.morningBriefing.map((line, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Mission — the "Auftrag" block, restyled with cleaner editorial hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle>Auftrag</CardTitle>
              <Badge variant="accent">
                <Gauge className="h-3 w-3" />
                {autonomyMeta[emp.autonomy].label}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface-soft/50 p-4">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <Target className="h-3.5 w-3.5 text-accent" /> Mission
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink">{emp.objective}</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Verantwortet
                  </p>
                  <ul className="space-y-2 text-sm text-ink-soft">
                    {emp.responsibilities.map((r) => (
                      <li key={r} className="flex gap-2.5">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-danger" /> Leitplanken
                  </p>
                  <ul className="space-y-2 text-sm text-ink-soft">
                    {emp.guardrails.map((g) => (
                      <li key={g} className="flex gap-2.5">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-danger" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <Zap className="h-3.5 w-3.5 text-warning" /> Wird aktiv bei
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {emp.triggers.map((t) => (
                    <Badge key={t} variant="warning">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline — open vs done */}
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Aufgaben</CardTitle>
              <Badge variant="outline">
                {openTasks.length} offen · {doneToday.length} erledigt
              </Badge>
            </CardHeader>
            <CardContent>
              {openTasks.length === 0 && doneToday.length === 0 ? (
                <EmptyState text={`${emp.name} hat aktuell nichts zugewiesen.`} />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <TaskColumn
                    icon={<CircleDot className="h-3.5 w-3.5 text-accent" />}
                    title="Offen"
                    items={openTasks}
                  />
                  <TaskColumn
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    title="Abgeschlossen"
                    items={doneToday}
                    muted
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capabilities — the integrations/jobs block (already a polished module) */}
          <AgentCapabilities employee={emp} />

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitätsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              {feed.length ? (
                <ActivityFeed events={feed} />
              ) : (
                <EmptyState text="Noch keine Aktivität in diesem Zeitraum." />
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-6">
          {/* Performance card with three metrics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <CardTitle>Leistung</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Metric
                label="Gesamteffizienz"
                value={emp.performance}
                tone="accent"
              />
              <Metric
                label="Autonomie-Quote"
                value={Math.round(emp.performance * 0.86)}
                tone="cyan"
              />
              <Metric
                label="Erfolgs­quote"
                value={successRate}
                tone="success"
              />
              <div className="mt-2 rounded-xl border border-border bg-surface-soft/50 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <Mail className="h-3 w-3" /> Interaktionen
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">
                  {formatNumber(emp.interactions)}
                </p>
                <p className="text-xs text-muted">in dieser Periode</p>
              </div>
            </CardContent>
          </Card>

          {/* Tools + Skills as separate dense card */}
          <Card>
            <CardHeader>
              <CardTitle>Fähigkeiten & Werkzeuge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <Brain className="h-3 w-3 text-accent" /> Fähigkeiten
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {emp.skills.map((s) => (
                    <Badge key={s} variant="accent">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <Hash className="h-3 w-3 text-cyan" /> Tools
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {emp.tools.map((t) => (
                    <Badge key={t} variant="default">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row
                icon={<Cpu className="h-3.5 w-3.5" />}
                label="Modell"
                value={emp.model}
                mono
              />
              <Row
                icon={<Brain className="h-3.5 w-3.5" />}
                label="Persönlichkeit"
                value={personalityMeta[emp.personality]}
              />
              <Row
                icon={<Gauge className="h-3.5 w-3.5" />}
                label="Autonomie"
                value={autonomyMeta[emp.autonomy].label}
              />
              <Row
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Im Team seit"
                value={new Date(emp.createdAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              />
            </CardContent>
          </Card>

          {/* Reporting line — who they hand off to */}
          <Card>
            <CardHeader>
              <CardTitle>Berichtswege</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted">
                {emp.name} verweist bei fremden Themen an:
              </p>
              <ul className="space-y-2">
                {teammates.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/employees/${t.id}`}
                      className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-surface-soft"
                    >
                      <Avatar name={t.name} color={t.avatarColor} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                        <p className="truncate text-[11px] text-muted">{roleMeta[t.role].label}</p>
                      </div>
                      <StatusDot status={t.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}

function KpiCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-5">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "cyan" | "success";
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-ink">{value}%</span>
      </div>
      <Progress value={value} tone={tone} className="mt-2" />
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-muted">
        {icon}
        {label}
      </span>
      <span className={mono ? "font-mono text-xs text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}

function TaskColumn({
  icon,
  title,
  items,
  muted,
}: {
  icon: React.ReactNode;
  title: string;
  items: { id: string; title: string; priority: string }[];
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft/30 p-3">
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {icon} {title}
      </p>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted">—</p>
      ) : (
        <ul className="space-y-1">
          {items.map((t) => (
            <li
              key={t.id}
              className={
                "flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 text-sm " +
                (muted ? "text-muted line-through" : "text-ink")
              }
            >
              <span
                className={
                  "h-1.5 w-1.5 shrink-0 rounded-full " +
                  (t.priority === "urgent"
                    ? "bg-danger"
                    : t.priority === "high"
                      ? "bg-warning"
                      : t.priority === "medium"
                        ? "bg-accent"
                        : "bg-muted")
                }
              />
              <span className="truncate">{t.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <CircleSlash className="h-5 w-5 text-muted" />
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
