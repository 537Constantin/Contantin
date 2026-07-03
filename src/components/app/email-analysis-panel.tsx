"use client";

import { Sparkles, ListChecks, CalendarClock, ReceiptText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORITY_META, type EmailAnalysis } from "@/lib/inbox";
import { cn } from "@/lib/utils";

/** Renders the AI analysis of an email + one-click reply suggestions. */
export function EmailAnalysisPanel({
  analysis,
  onUseReply,
}: {
  analysis: EmailAnalysis;
  onUseReply: (text: string) => void;
}) {
  const prio = PRIORITY_META[analysis.priority];
  const replies: { key: keyof EmailAnalysis["replySuggestions"]; label: string }[] = [
    { key: "professional", label: "Professionell" },
    { key: "friendly", label: "Freundlich" },
    { key: "short", label: "Kurz & prägnant" },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Sparkles className="h-4 w-4 text-accent" /> KI-Analyse
        </span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", prio.cls)}>Priorität: {prio.label}</span>
        {analysis.category && <Badge variant="outline">{analysis.category}</Badge>}
        {analysis.sentiment && <Badge variant="outline">{analysis.sentiment}</Badge>}
        {analysis.language && <Badge variant="outline">{analysis.language}</Badge>}
        {analysis.invoiceOrOffer && (
          <Badge variant="warning"><ReceiptText className="h-3 w-3" /> Rechnung/Angebot</Badge>
        )}
      </div>

      {analysis.summary && <p className="text-sm leading-relaxed text-ink-soft">{analysis.summary}</p>}

      {analysis.tasks.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <ListChecks className="h-3.5 w-3.5" /> Aufgaben
          </p>
          <ul className="space-y-1">
            {analysis.tasks.map((t, i) => (
              <li key={i} className="rounded-lg bg-surface/60 px-2.5 py-1.5 text-[13px] text-ink-soft">
                <span className="font-medium text-ink">{t.task}</span>
                {t.deadline && <span className="text-muted"> · bis {t.deadline}</span>}
                {t.person && <span className="text-muted"> · {t.person}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.dates.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <CalendarClock className="h-3.5 w-3.5" /> Termine
          </p>
          <ul className="space-y-1">
            {analysis.dates.map((d, i) => (
              <li key={i} className="rounded-lg bg-surface/60 px-2.5 py-1.5 text-[13px] text-ink-soft">
                <span className="font-medium text-ink">{[d.date, d.time].filter(Boolean).join(" ")}</span>
                {d.description && <span className="text-muted"> · {d.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Antwortvorschläge</p>
        <div className="space-y-2">
          {replies.map(({ key, label }) => {
            const text = analysis.replySuggestions[key];
            if (!text) return null;
            return (
              <div key={key} className="rounded-lg border border-border bg-surface p-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">{label}</span>
                  <Button variant="outline" size="sm" onClick={() => onUseReply(text)}>
                    Übernehmen <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
