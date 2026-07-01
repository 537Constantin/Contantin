"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Trash2, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT_COLORS, colorClasses, type CalendarEvent, type EventColor } from "@/lib/calendar";
import { tapHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const rid = () => Math.random().toString(36).slice(2, 9);

export function EventDialog({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  /** Existing event (edit) or a seed with at least a date (new). */
  initial: (Partial<CalendarEvent> & { date: string }) | null;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
}) {
  const editing = Boolean(initial?.id);

  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState("");
  const [allDay, setAllDay] = React.useState(false);
  const [start, setStart] = React.useState("09:00");
  const [end, setEnd] = React.useState("10:00");
  const [location, setLocation] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [color, setColor] = React.useState<EventColor>("accent");

  React.useEffect(() => {
    if (!open || !initial) return;
    setTitle(initial.title ?? "");
    setDate(initial.date);
    setAllDay(initial.allDay ?? false);
    setStart(initial.start ?? "09:00");
    setEnd(initial.end ?? "10:00");
    setLocation(initial.location ?? "");
    setNotes(initial.notes ?? "");
    setColor(initial.color ?? "accent");
  }, [open, initial]);

  function save() {
    if (!title.trim() || !date) return;
    tapHaptic();
    const ev: CalendarEvent = {
      id: initial?.id ?? rid(),
      title: title.trim(),
      date,
      allDay,
      start: allDay ? undefined : start,
      end: allDay ? undefined : end,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      color,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(ev);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && initial && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="pb-safe relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-float)] sm:max-w-md sm:rounded-[var(--radius-card)] sm:pb-0"
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">
                {editing ? "Termin bearbeiten" : "Neuer Termin"}
              </h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink" aria-label="Schließen">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <Field label="Titel">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z. B. Kundentermin Nordwind"
                  autoFocus
                  className={inputCls}
                />
              </Field>

              <Field label="Datum">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </Field>

              {/* All-day toggle */}
              <button
                type="button"
                onClick={() => { tapHaptic(); setAllDay((v) => !v); }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-soft/40 px-3.5 py-2.5 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Clock className="h-4 w-4 text-muted" /> Ganztägig
                </span>
                <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", allDay ? "bg-accent" : "bg-surface-soft ring-1 ring-border")}>
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", allDay ? "left-[22px]" : "left-0.5")} />
                </span>
              </button>

              {!allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Von">
                    <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Bis">
                    <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
                  </Field>
                </div>
              )}

              <Field label="Ort (optional)">
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="z. B. Büro / Video-Call" className={inputCls} />
              </Field>

              <Field label="Notiz (optional)">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Details, Agenda …" className={taCls} />
              </Field>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink">Farbe</span>
                <div className="flex gap-2">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={c}
                      className={cn(
                        "h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform hover:scale-110",
                        colorClasses[c].dot,
                        color === c ? "ring-ink" : "ring-transparent",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
              {editing && onDelete ? (
                <Button variant="ghost" size="sm" onClick={() => { tapHaptic(); onDelete(initial!.id!); onClose(); }}>
                  <Trash2 className="h-4 w-4" /> Löschen
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={onClose}>Abbrechen</Button>
              )}
              <Button variant="accent" size="sm" onClick={save} disabled={!title.trim() || !date}>
                <Check className="h-4 w-4" /> Speichern
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";
const taCls =
  "w-full resize-y rounded-xl border border-border bg-surface-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
