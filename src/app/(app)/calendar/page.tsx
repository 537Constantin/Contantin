"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { EventDialog } from "@/components/app/event-dialog";
import { PushToggle } from "@/components/app/push-toggle";
import {
  WEEKDAYS, monthLabel, monthGrid, toISODate, todayISO, eventsForDay, minutesOf,
  formatDayLong, colorClasses, type CalendarEvent,
} from "@/lib/calendar";
import { loadItems, saveItems } from "@/lib/store-sync";
import { tapHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const DAY_START = 6; // 06:00
const DAY_END = 23; // 23:00
const PX_PER_HOUR = 46;

export default function CalendarPage() {
  const now = new Date();
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());
  const [selected, setSelected] = React.useState(todayISO());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogInitial, setDialogInitial] = React.useState<(Partial<CalendarEvent> & { date: string }) | null>(null);

  React.useEffect(() => {
    void loadItems<CalendarEvent>("event").then((e) => { setEvents(e); setLoaded(true); });
  }, []);
  React.useEffect(() => {
    if (loaded) void saveItems("event", events);
  }, [events, loaded]);

  const grid = React.useMemo(() => monthGrid(year, month), [year, month]);
  const todayStr = todayISO();
  const dayEvents = eventsForDay(events, selected);
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);

  function shiftMonth(delta: number) {
    tapHaptic();
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }
  function goToday() {
    tapHaptic();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelected(todayStr);
  }

  function openNew(dateISO: string) {
    setDialogInitial({ date: dateISO });
    setDialogOpen(true);
  }
  function openEdit(ev: CalendarEvent) {
    setDialogInitial(ev);
    setDialogOpen(true);
  }
  function upsert(ev: CalendarEvent) {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === ev.id);
      return exists ? prev.map((e) => (e.id === ev.id ? ev : e)) : [...prev, ev];
    });
    setSelected(ev.date);
  }
  function remove(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <PageShell>
      <PageHeader
        title="Kalender"
        description="Trage Termine ein – ganztägig oder mit Uhrzeit. Alles wird gespeichert und dient deinen KI-Mitarbeitern später als Grundlage für die Tagesplanung."
      >
        <PushToggle />
        <Button variant="accent" size="sm" onClick={() => openNew(selected)}>
          <Plus className="h-4 w-4" /> Neuer Termin
        </Button>
      </PageHeader>

      {/* Month nav */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={() => shiftMonth(-1)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink" aria-label="Vorheriger Monat">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="min-w-[9.5rem] text-center font-display text-lg font-semibold tracking-tight text-ink">
            {monthLabel(year, month)}
          </h2>
          <button onClick={() => shiftMonth(1)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink" aria-label="Nächster Monat">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>Heute</Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Month grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-7 border-b border-border pb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium uppercase tracking-wide text-muted">{d}</div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1 grid grid-cols-7 gap-1"
            >
              {grid.flat().map((d) => {
                const iso = toISODate(d);
                const inMonth = d.getMonth() === month;
                const isToday = iso === todayStr;
                const isSel = iso === selected;
                const evs = eventsForDay(events, iso);
                return (
                  <button
                    key={iso}
                    onClick={() => { tapHaptic(); setSelected(iso); }}
                    className={cn(
                      "tap flex min-h-[76px] flex-col rounded-xl border p-1.5 text-left transition-colors sm:min-h-[92px]",
                      isSel ? "border-accent/50 bg-accent/5" : "border-transparent hover:bg-surface-soft/60",
                      !inMonth && "opacity-40",
                    )}
                  >
                    <span className={cn(
                      "mb-1 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
                      isToday ? "bg-ink text-canvas" : "text-ink",
                    )}>
                      {d.getDate()}
                    </span>
                    <span className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className={cn("truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight", colorClasses[e.color].chip)}>
                          {e.allDay ? e.title : `${e.start} ${e.title}`}
                        </span>
                      ))}
                      {evs.length > 3 && <span className="px-1 text-[10px] text-muted">+{evs.length - 3} mehr</span>}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Day panel */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-soft)] lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <CalendarDays className="h-3.5 w-3.5" /> Tagesansicht
              </p>
              <p className="mt-0.5 font-display text-base font-semibold text-ink">{formatDayLong(selected)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openNew(selected)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* All-day */}
          {allDayEvents.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {allDayEvents.map((e) => (
                <button key={e.id} onClick={() => openEdit(e)} className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm font-medium", colorClasses[e.color].chip)}>
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", colorClasses[e.color].dot)} />
                  <span className="truncate">{e.title}</span>
                  <span className="ml-auto text-[11px] opacity-70">ganztägig</span>
                </button>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="mt-3 max-h-[560px] overflow-y-auto">
            <div className="relative" style={{ height: (DAY_END - DAY_START) * PX_PER_HOUR }}>
              {Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i).map((h) => (
                <div key={h} className="absolute left-0 right-0 border-t border-border-soft" style={{ top: (h - DAY_START) * PX_PER_HOUR }}>
                  <span className="absolute -top-2 left-0 text-[10px] tabular-nums text-muted">{String(h).padStart(2, "0")}:00</span>
                </div>
              ))}
              {timedEvents.map((e) => {
                const s = Math.max(minutesOf(e.start), DAY_START * 60);
                const en = Math.min(Math.max(minutesOf(e.end), s + 30), DAY_END * 60);
                const top = ((s - DAY_START * 60) / 60) * PX_PER_HOUR;
                const height = Math.max(22, ((en - s) / 60) * PX_PER_HOUR - 2);
                return (
                  <button
                    key={e.id}
                    onClick={() => openEdit(e)}
                    className={cn("absolute left-11 right-1 overflow-hidden rounded-lg border-l-[3px] bg-surface-soft/70 px-2 py-1 text-left ring-1 ring-border transition-colors hover:bg-surface-soft")}
                    style={{ top, height, borderLeftColor: `var(--color-${e.color})` }}
                  >
                    <p className="truncate text-[12px] font-semibold text-ink">{e.title}</p>
                    <p className="truncate text-[10px] text-muted">{e.start}–{e.end}{e.location ? ` · ${e.location}` : ""}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {dayEvents.length === 0 && (
            <div className="mt-3 rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted">
              Keine Termine an diesem Tag.
            </div>
          )}
        </div>
      </div>

      <EventDialog
        open={dialogOpen}
        initial={dialogInitial}
        onClose={() => setDialogOpen(false)}
        onSave={upsert}
        onDelete={remove}
      />
    </PageShell>
  );
}
