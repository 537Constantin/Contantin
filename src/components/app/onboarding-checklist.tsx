"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Inbox, CalendarDays, Sparkles, ReceiptText, Check, ArrowRight, Rocket, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { loadItems } from "@/lib/store-sync";
import type { CalendarEvent } from "@/lib/calendar";
import type { UserTask } from "@/lib/data/tasks";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "workforce-os:onboarding-dismissed";

interface Step {
  id: string;
  label: string;
  desc: string;
  href: string;
  icon: typeof Inbox;
  done: boolean;
}

/**
 * "Erste Schritte" — a getting-started checklist on the dashboard that tracks
 * the user's real progress across the core features and links to each. Hides
 * itself once every step is done or the user dismisses it.
 */
export function OnboardingChecklist() {
  const [steps, setSteps] = React.useState<Step[] | null>(null);
  const [dismissed, setDismissed] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem(DISMISS_KEY)) return;
    setDismissed(false);

    let cancelled = false;
    (async () => {
      const [events, tasks, receipts, mailbox] = await Promise.all([
        loadItems<CalendarEvent>("event").catch(() => []),
        loadItems<UserTask>("task").catch(() => []),
        loadItems<{ id: string }>("receipt").catch(() => []),
        fetch("/api/inbox/status", { cache: "no-store" })
          .then((r) => r.json())
          .then((j) => Boolean(j.connected))
          .catch(() => false),
      ]);
      if (cancelled) return;
      setSteps([
        { id: "inbox", label: "Postfach verbinden", desc: "E-Mails empfangen & von der KI analysieren lassen", href: "/inbox", icon: Inbox, done: mailbox },
        { id: "task", label: "Aufgabe einrichten", desc: "Deinem KI-Mitarbeiter die erste Aufgabe geben", href: "/employees", icon: Sparkles, done: tasks.some((t) => t.configured) },
        { id: "event", label: "Ersten Termin planen", desc: "Kalender füllen – die KI plant deinen Tag", href: "/calendar", icon: CalendarDays, done: events.length > 0 },
        { id: "receipt", label: "Beleg scannen", desc: "Rechnung fotografieren, Daten automatisch erfassen", href: "/receipts", icon: ReceiptText, done: receipts.length > 0 },
      ]);
    })();
    return () => { cancelled = true; };
  }, []);

  function dismiss() {
    try { window.localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    setDismissed(true);
  }

  if (dismissed || !steps) return null;

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null; // all set — nothing to nudge

  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <Card className="overflow-hidden border-accent/25 bg-gradient-to-br from-accent/[0.08] to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Rocket className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-ink">Erste Schritte</p>
                  <p className="text-xs text-muted">{doneCount} von {steps.length} erledigt – in wenigen Minuten startklar</p>
                </div>
              </div>
              <button onClick={dismiss} aria-label="Ausblenden" className="tap -mr-1 -mt-1 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-soft/60 hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {steps.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border p-3 transition-colors",
                    s.done
                      ? "border-border bg-surface-soft/30"
                      : "border-border bg-surface hover:border-accent/40 hover:bg-surface-soft/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      s.done ? "bg-success/15 text-success" : "bg-accent/12 text-accent",
                    )}
                  >
                    {s.done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium", s.done ? "text-muted line-through" : "text-ink")}>{s.label}</p>
                    {!s.done && <p className="truncate text-xs text-muted">{s.desc}</p>}
                  </div>
                  {!s.done && <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
