"use client";

import * as React from "react";
import { Sparkles, ListChecks, CalendarClock, ReceiptText, ArrowRight, CalendarPlus, Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORITY_META, type EmailAnalysis } from "@/lib/inbox";
import { parseLooseDate, cleanTime, todayISO } from "@/lib/calendar";
import { cn } from "@/lib/utils";

/** What we hand to the page to create a calendar event. */
export interface CalendarDraft {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
}

const fieldCls =
  "h-9 w-full rounded-lg border border-border bg-surface-soft/50 px-2.5 text-[13px] text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";

/**
 * A single "In Kalender" action: opens a small confirm/edit field (title, date,
 * time) prefilled from the AI draft, so the user can adjust before it's saved.
 */
function CalendarAction({
  draft,
  onAdd,
}: {
  draft: CalendarDraft;
  onAdd: (draft: CalendarDraft) => Promise<boolean>;
}) {
  const [phase, setPhase] = React.useState<"idle" | "editing" | "saving" | "done">("idle");
  const [title, setTitle] = React.useState(draft.title);
  const [date, setDate] = React.useState(draft.date);
  const [time, setTime] = React.useState(draft.time ?? "");

  if (phase === "done") {
    return (
      <Button variant="ghost" size="sm" className="mt-1.5" disabled>
        <Check className="h-3.5 w-3.5" /> Im Kalender
      </Button>
    );
  }

  if (phase === "idle") {
    return (
      <Button variant="outline" size="sm" className="mt-1.5" onClick={() => setPhase("editing")}>
        <CalendarPlus className="h-3.5 w-3.5" /> In Kalender
      </Button>
    );
  }

  async function confirm() {
    if (!date || phase === "saving") return;
    setPhase("saving");
    const ok = await onAdd({ title: title.trim() || "Termin aus E-Mail", date, time: time || undefined, notes: draft.notes });
    setPhase(ok ? "done" : "editing");
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border bg-surface p-2.5">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel" className={fieldCls} />
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">Datum</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">Uhrzeit</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldCls} />
        </label>
      </div>
      <p className="text-[11px] text-muted">Uhrzeit leer lassen = ganztägig.</p>
      <div className="flex gap-2">
        <Button variant="accent" size="sm" onClick={confirm} disabled={!date || phase === "saving"}>
          {phase === "saving" ? "Speichert …" : "Hinzufügen"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPhase("idle")}>Abbrechen</Button>
      </div>
    </div>
  );
}

/** Renders the AI analysis of an email + one-click reply / calendar actions. */
export function EmailAnalysisPanel({
  analysis,
  onUseReply,
  onAddToCalendar,
  sourceSubject,
}: {
  analysis: EmailAnalysis;
  onUseReply: (text: string) => void;
  onAddToCalendar?: (draft: CalendarDraft) => Promise<boolean>;
  sourceSubject?: string;
}) {
  const prio = PRIORITY_META[analysis.priority];
  const replies: { key: keyof EmailAnalysis["replySuggestions"]; label: string }[] = [
    { key: "professional", label: "Professionell" },
    { key: "friendly", label: "Freundlich" },
    { key: "short", label: "Kurz & prägnant" },
  ];
  const fromMail = sourceSubject ? `Aus E-Mail: ${sourceSubject}` : undefined;

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
                {onAddToCalendar && (
                  <div>
                    <CalendarAction
                      onAdd={onAddToCalendar}
                      draft={{
                        title: t.task || "Aufgabe aus E-Mail",
                        date: parseLooseDate(t.deadline) ?? todayISO(),
                        notes: [t.deadline && `Frist: ${t.deadline}`, t.person && `Kontakt: ${t.person}`, fromMail]
                          .filter(Boolean)
                          .join("\n"),
                      }}
                    />
                  </div>
                )}
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
                {onAddToCalendar && (
                  <div>
                    <CalendarAction
                      onAdd={onAddToCalendar}
                      draft={{
                        title: d.description?.trim() || (sourceSubject ? `Termin: ${sourceSubject}` : "Termin aus E-Mail"),
                        date: parseLooseDate(d.date) ?? todayISO(),
                        time: cleanTime(d.time),
                        notes: fromMail,
                      }}
                    />
                  </div>
                )}
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

      <p className="flex items-start gap-1.5 border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        KI-generiert – Ergebnisse können Fehler enthalten. Bitte vor der Nutzung prüfen; keine rechtliche, steuerliche oder medizinische Beratung.
      </p>
    </div>
  );
}
