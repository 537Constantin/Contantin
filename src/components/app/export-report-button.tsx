"use client";

import * as React from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Kpi } from "@/lib/data/analytics";
import type { Insight } from "@/lib/types";

const impactLabel = { high: "hohe", medium: "mittlere", low: "geringe" } as const;
const categoryLabel = { growth: "Wachstum", efficiency: "Effizienz", risk: "Risiko", cost: "Kosten" } as const;

/** Builds a plain-text analysis report from the on-screen data and downloads it. */
export function ExportReportButton({ kpis, insights }: { kpis: Kpi[]; insights: Insight[] }) {
  const [done, setDone] = React.useState(false);

  function exportReport() {
    const now = new Date();
    const lines: string[] = [
      "AI Workforce OS – Analyse-Report",
      `Erstellt: ${now.toLocaleString("de-DE")}`,
      "",
      "== Kennzahlen ==",
      ...kpis.map((k) => `- ${k.label}: ${k.value} (${k.delta >= 0 ? "+" : ""}${k.delta.toFixed(1)} %)`),
      "",
      `== Handlungsempfehlungen (${insights.length}) ==`,
    ];
    for (const ins of insights) {
      lines.push(
        "",
        `[${categoryLabel[ins.category]} · ${impactLabel[ins.impact]} Wirkung] ${ins.title}`,
        `  Situation:  ${ins.summary}`,
        `  Empfehlung: ${ins.recommendation}`,
      );
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workforce-report-${now.toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setDone(true);
    window.setTimeout(() => setDone(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={exportReport}>
      {done ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      {done ? "Exportiert" : "Report exportieren"}
    </Button>
  );
}
