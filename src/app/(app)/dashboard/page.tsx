import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles, Plus } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { ActivityFeed } from "@/components/app/activity-feed";
import { BarChart, AreaChart, Donut } from "@/components/app/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusDot } from "@/components/app/status";
import { Reveal } from "@/components/motion/reveal";
import { kpis, throughput, revenueSeries, workloadSplit } from "@/lib/data/analytics";
import { activity, tasks } from "@/lib/data/activity";
import { employees, employeeName } from "@/lib/data/employees";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const priorityTone = {
  urgent: "danger",
  high: "warning",
  medium: "accent",
  low: "default",
} as const;

export default function DashboardPage() {
  const openTasks = tasks.filter((t) => t.state !== "done").slice(0, 5);

  return (
    <PageShell>
      <PageHeader
        title="Guten Morgen, Constantin"
        description="Deine KI-Belegschaft hat heute Nacht 41 Mails triagiert, 31 Tickets gelöst und 4 Reports erstellt."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/analytics">Report ansehen</Link>
        </Button>
        <Button variant="accent" size="sm" asChild>
          <Link href="/chat">
            <Sparkles className="h-4 w-4" /> Team fragen
          </Link>
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Reveal key={kpi.id} delay={i * 0.05} y={16}>
            <KpiCard kpi={kpi} />
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Wochenauslastung</CardTitle>
              <p className="mt-1 text-sm text-muted">Bearbeitete Vorgänge nach Typ</p>
            </div>
            <Badge variant="success">+14 % ggü. Vorwoche</Badge>
          </CardHeader>
          <CardContent>
            <BarChart data={throughput} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivität</CardTitle>
            <Link href="/analytics" className="text-xs font-medium text-accent hover:underline">
              Alle
            </Link>
          </CardHeader>
          <CardContent className="max-h-[320px] overflow-y-auto">
            <ActivityFeed events={activity.slice(0, 6)} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Beeinflusster Umsatz</CardTitle>
            <Badge variant="accent">€ Tausend</Badge>
          </CardHeader>
          <CardContent>
            <AreaChart data={revenueSeries} tone="accent" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arbeitsverteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={workloadSplit} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prioritäten heute</CardTitle>
            <Link href="/workflows" className="text-xs font-medium text-accent hover:underline">
              Aufgaben
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {openTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-soft/60">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", t.priority === "urgent" ? "bg-danger" : t.priority === "high" ? "bg-warning" : "bg-accent")} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                  <p className="text-xs text-muted">{employeeName(t.employeeId)}</p>
                </div>
                <Badge variant={priorityTone[t.priority]}>{t.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Deine KI-Belegschaft</CardTitle>
            <p className="mt-1 text-sm text-muted">{employees.length} Agenten · Live-Status</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/employees">
              Alle verwalten <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {employees.map((emp) => (
              <Link
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface-soft/40 p-3 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-accent/30"
              >
                <Avatar name={emp.name} color={emp.avatarColor} glow />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{emp.name}</p>
                    <StatusDot status={emp.status} />
                  </div>
                  <p className="truncate text-xs text-muted">{emp.roleLabel}</p>
                  <Progress value={emp.performance} tone="accent" className="mt-2" />
                </div>
              </Link>
            ))}
            <Link
              href="/employees?new=1"
              className="flex min-h-[86px] items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Plus className="h-4 w-4" /> Mitarbeiter hinzufügen
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
