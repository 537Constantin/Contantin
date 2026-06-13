"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roleMeta, personalityMeta } from "@/lib/data/employees";
import { buildUserEmployee } from "@/lib/data/user-employees";
import { cn } from "@/lib/utils";
import type { AIEmployee, EmployeeRole, Personality } from "@/lib/types";

const roles = Object.keys(roleMeta) as EmployeeRole[];
const personalities = Object.keys(personalityMeta) as Personality[];

export function CreateEmployeeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  /** Called with the freshly built employee so the page can persist it. */
  onCreated?: (employee: AIEmployee) => void;
}) {
  const [step, setStep] = React.useState(0);
  const [role, setRole] = React.useState<EmployeeRole>("secretary");
  const [name, setName] = React.useState("");
  const [personality, setPersonality] = React.useState<Personality>("professional");
  const [created, setCreated] = React.useState(false);

  const meta = roleMeta[role];

  React.useEffect(() => {
    if (open) {
      setStep(0);
      setCreated(false);
      setName("");
    }
  }, [open]);

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  function create() {
    onCreated?.(buildUserEmployee({ name, role, personality }));
    setCreated(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
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
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-float)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="font-display text-lg font-semibold text-ink">Neuer KI-Mitarbeiter</h2>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink" aria-label="Schließen">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!created && (
              <div className="flex gap-1.5 px-6 pt-4">
                {[0, 1, 2].map((s) => (
                  <span key={s} className={cn("h-1 flex-1 rounded-full transition-colors", s <= step ? "bg-accent" : "bg-surface-soft")} />
                ))}
              </div>
            )}

            <div className="px-6 py-5">
              {created ? (
                <div className="py-6 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                    {name || meta.label} ist startklar
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                    Dein neuer {meta.label} wurde erstellt und beginnt mit dem Training auf deine Daten.
                  </p>
                  <Button variant="accent" className="mt-5" onClick={onClose}>
                    Zum Team
                  </Button>
                </div>
              ) : step === 0 ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-ink">Welche Rolle soll dieser Agent übernehmen?</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {roles.map((r) => {
                      const rm = roleMeta[r];
                      const active = r === role;
                      return (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className={cn(
                            "rounded-xl border p-3 text-left transition-all",
                            active ? "border-accent/60 bg-accent/8 ring-1 ring-accent/30" : "border-border hover:border-accent/30",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: rm.color }} />
                            <span className="text-sm font-semibold text-ink">{rm.label}</span>
                          </span>
                          <span className="mt-1 block text-xs text-muted">{rm.blurb}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="z. B. Aria, Marcus, Nova…"
                      className="h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Persönlichkeit</label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {personalities.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPersonality(p)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                            p === personality ? "border-accent/60 bg-accent/8 text-ink" : "border-border text-ink-soft hover:border-accent/30",
                          )}
                        >
                          {personalityMeta[p]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-ink">Fähigkeiten & Tools</p>
                  <p className="text-xs text-muted">Vorausgewählt anhand der Rolle. Du kannst später jederzeit anpassen.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.defaultSkills.map((s) => (
                      <span key={s} className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent ring-1 ring-accent/20">{s}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meta.defaultTools.map((t) => (
                      <span key={t} className="rounded-full bg-surface-soft px-2.5 py-1 text-xs text-ink-soft">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!created && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <Button variant="ghost" size="sm" onClick={step === 0 ? onClose : back}>
                  {step === 0 ? "Abbrechen" : "Zurück"}
                </Button>
                {step < 2 ? (
                  <Button variant="accent" size="sm" onClick={next} disabled={step === 1 && !name.trim()}>
                    Weiter
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" onClick={create}>
                    <Sparkles className="h-4 w-4" /> Erstellen
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
