"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Loader2, CalendarClock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChatMarkdown } from "@/components/app/chat-markdown";
import { SpotlightCard } from "@/components/motion/fx";
import {
  eventsForDay, toISODate, formatDayLong, colorClasses, type CalendarEvent,
} from "@/lib/calendar";
import { loadItems } from "@/lib/store-sync";
import { tapHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

function isoOffset(days: number): string {
  const t = new Date();
  return toISODate(new Date(t.getFullYear(), t.getMonth(), t.getDate() + days));
}

export function TodayPlan() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [dateISO, setDateISO] = React.useState(isoOffset(0));
  const [todos, setTodos] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    void loadItems<CalendarEvent>("event").then(setEvents);
  }, []);

  const dayEvents = eventsForDay(events, dateISO);

  function pickDay(iso: string) {
    tapHaptic();
    setDateISO(iso);
    setPlan("");
    setError("");
  }

  async function generate() {
    if (loading) return;
    tapHaptic(12);
    setLoading(true);
    setError("");
    setPlan("");
    try {
      const res = await fetch("/api/day-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateLabel: formatDayLong(dateISO),
          events: dayEvents.map((e) => ({
            title: e.title, allDay: e.allDay, start: e.start, end: e.end, location: e.location,
          })),
          todos,
        }),
      });
      const json = await res.json();
      if (res.ok && json.plan) setPlan(json.plan);
      else setError(json.error ?? "Konnte keinen Plan erstellen.");
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  const days = [
    { iso: isoOffset(0), label: "Heute" },
    { iso: isoOffset(1), label: "Morgen" },
  ];

  return (
    <SpotlightCard className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-accent),var(--color-cyan))] text-canvas">
            <CalendarClock className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-ink">Dein Tag</p>
            <p className="text-xs text-muted">KI-Tagesplan aus deinem Kalender</p>
          </div>
        </div>
        <div className="flex gap-1 rounded-full bg-surface-soft p-0.5">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => pickDay(d.iso)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                dateISO === d.iso ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-medium text-ink">{formatDayLong(dateISO)}</p>

        {/* Today's events (real data) */}
        {dayEvents.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {dayEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-2.5 text-sm">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", colorClasses[e.color].dot)} />
                <span className="w-24 shrink-0 tabular-nums text-muted">
                  {e.allDay ? "ganztägig" : `${e.start}–${e.end}`}
                </span>
                <span className="truncate text-ink">{e.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted">
            Keine Termine an diesem Tag.
            <Link href="/calendar" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
              Termin eintragen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        )}

        {/* Optional to-dos */}
        <textarea
          value={todos}
          onChange={(e) => setTodos(e.target.value)}
          rows={2}
          placeholder="Weitere To-dos für den Tag (optional) – z. B. Angebot Nordwind fertig machen, Steuerberater anrufen …"
          className="mt-4 w-full resize-y rounded-xl border border-border bg-surface-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
        />

        <Button variant="accent" size="sm" onClick={generate} disabled={loading} className="mt-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Plant deinen Tag …" : "KI-Tagesplan erstellen"}
        </Button>

        {error && <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">{error}</p>}

        <AnimatePresence>
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm leading-relaxed text-ink-soft"
            >
              <ChatMarkdown content={plan} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
}
