import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Gauge, ShieldAlert, PiggyBank, Lightbulb, Sparkles } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/app/kpi-card";
import { AreaChart, BarChart, Donut } from "@/components/app/charts";
import { ExportReportButton } from "@/components/app/export-report-button";
import { AiDisclaimer } from "@/components/app/ai-disclaimer";
import { kpis, revenueSeries, throughput, workloadSplit, insights } from "@/lib/data/analytics";
import type { Insight } from "@/lib/types";

export const metadata: Metadata = { title: "Analytics & Beratung" };

const categoryMeta = {
  growth: { label: "Wachstum", icon: TrendingUp, color: "var(--color-success)" },
  efficiency: { label: "Effizienz", icon: Gauge, color: "var(--color-accent)" },
  risk: { label: "Risiko", icon: ShieldAlert, color: "var(--color-danger)" },
  cost: { label: "Kosten", icon: PiggyBank, color: "var(--color-cyan)" },
} as const;

const impactVariant = { high: "danger", medium: "warning", low: "default" } as const;

export default function AnalyticsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Analytics & KI-Beratung"
        description="Marcus, dein KI-Unternehmensberater, analysiert deine Daten laufend und liefert umsetzbare Handlungsempfehlungen."
      >
        <ExportReportButton kpis={kpis} insights={insights} />
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Umsatzentwicklung</CardTitle>
            <Badge variant="success">+71 % H1</Badge>
          </CardHeader>
          <CardContent>
            <AreaChart data={revenueSeries} tone="success" />
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
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Operative Auslastung</CardTitle>
          <Badge variant="accent">Letzte 7 Tage</Badge>
        </CardHeader>
        <CardContent>
          <BarChart data={throughput} />
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-accent" />
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Handlungsempfehlungen</h2>
        <Badge variant="accent">{insights.length} neu</Badge>
      </div>
      <AiDisclaimer className="mt-1.5" text="KI-generierte Empfehlungen – können Fehler enthalten, bitte eigenständig prüfen." />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {insights.map((ins) => (
          <InsightCard key={ins.id} insight={ins} />
        ))}
      </div>
    </PageShell>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const cm = categoryMeta[insight.category];
  const Icon = cm.icon;
  return (
    <Card hover>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${cm.color} 14%, transparent)`, color: cm.color }}>
              <Icon className="h-4.5 w-4.5" />
            </span>
            <Badge variant="outline">{cm.label}</Badge>
          </div>
          <Badge variant={impactVariant[insight.impact]}>{insight.impact === "high" ? "Hohe" : insight.impact === "medium" ? "Mittlere" : "Geringe"} Wirkung</Badge>
        </div>
        <h3 className="mt-3 font-semibold leading-snug text-ink">{insight.title}</h3>
        <p className="mt-1.5 text-sm text-muted">{insight.summary}</p>
        <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Empfehlung</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{insight.recommendation}</p>
        </div>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="accent" size="sm">
            <Link
              href={`/chat?agent=emp-marcus&prompt=${encodeURIComponent(
                `Hilf mir, diese Empfehlung umzusetzen: „${insight.title}". Situation: ${insight.summary} Empfehlung: ${insight.recommendation} Erstelle mir einen konkreten Umsetzungsplan.`,
              )}`}
            >
              <Sparkles className="h-4 w-4" /> Mit Marcus umsetzen
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
