"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check, Plug, Zap, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowAvatar } from "@/components/ui/glow-avatar";
import { getEmployee } from "@/lib/data/employees";
import type { EmployeeTask, UserTask } from "@/lib/data/tasks";
import { cn } from "@/lib/utils";

export function TaskSetupDialog({
  task,
  userTask,
  onClose,
  onSave,
}: {
  task: EmployeeTask | null;
  userTask?: UserTask;
  onClose: () => void;
  onSave: (taskId: string, patch: Partial<UserTask>) => void;
}) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [automated, setAutomated] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Re-seed the form whenever a different task is opened.
  React.useEffect(() => {
    if (task) {
      setValues(userTask?.values ?? {});
      setAutomated(userTask?.automated ?? false);
      setSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  if (!task) return null;

  const emp = getEmployee(task.employeeId);
  const configured = userTask?.configured ?? false;
  const missingRequired = task.fields.some((f) => f.required && !values[f.id]?.trim());

  function setField(id: string, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  function save() {
    onSave(task!.id, { values, configured: true, automated });
    setSaved(true);
    window.setTimeout(() => onClose(), 1150);
  }

  function reset() {
    onSave(task!.id, { values: {}, configured: false, automated: false });
    setValues({});
    setAutomated(false);
  }

  return (
    <AnimatePresence>
      {task && (
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
            className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-float)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Success splash */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  className="absolute inset-0 z-20 grid place-items-center bg-surface/85 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <motion.span
                      className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success ring-1 ring-success/30"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    >
                      {automated ? <Zap className="h-8 w-8" /> : <Check className="h-8 w-8" />}
                    </motion.span>
                    <motion.p
                      className="mt-4 font-display text-lg font-semibold text-ink"
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.12 }}
                    >
                      {automated ? "Automatisierung aktiv" : "Aufgabe eingerichtet"}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
              <div className="flex items-start gap-3">
                {emp && <GlowAvatar name={emp.name} color={emp.avatarColor} size="md" />}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink">{task.title}</h2>
                    {configured && <Badge variant="success"><Check className="h-3 w-3" /> Eingerichtet</Badge>}
                  </div>
                  {emp && <p className="text-xs text-muted">{emp.name} · {emp.roleLabel}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <p className="text-sm leading-relaxed text-ink-soft">{task.description}</p>

              {task.account && (
                <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-soft/40 p-3 text-sm">
                  <Plug className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-ink">Benötigter Account</p>
                    <p className="text-muted">{task.account}</p>
                  </div>
                </div>
              )}

              {/* Setup fields */}
              <div className="space-y-3.5">
                {task.fields.map((field) => (
                  <div key={field.id}>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      {field.label}
                      {field.required && <span className="ml-1 text-danger">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={values[field.id] ?? ""}
                        onChange={(e) => setField(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full resize-y rounded-xl border border-border bg-surface-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={values[field.id] ?? ""}
                        onChange={(e) => setField(field.id, e.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3 text-sm text-ink focus:border-accent/40 focus:bg-surface focus:outline-none"
                      >
                        <option value="">Bitte wählen …</option>
                        {field.options?.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={values[field.id] ?? ""}
                        onChange={(e) => setField(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
                      />
                    )}
                    {field.help && <p className="mt-1 text-xs text-muted">{field.help}</p>}
                  </div>
                ))}
              </div>

              {task.fields.some((f) => f.type === "password") && (
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" /> Zugangsdaten werden in deinem Account gespeichert.
                </p>
              )}

              {/* Automation: only once the task is set up and if it supports it */}
              {task.automatable && (
                <div
                  className={cn(
                    "rounded-xl border p-3.5 transition-colors",
                    configured ? "border-accent/30 bg-accent/5" : "border-dashed border-border bg-surface-soft/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Zap className={cn("mt-0.5 h-4 w-4 shrink-0", configured ? "text-accent" : "text-muted")} />
                      <div>
                        <p className="text-sm font-medium text-ink">Automatisieren</p>
                        <p className="text-xs text-muted">
                          {configured
                            ? task.automationHint ?? "Läuft danach von selbst – ohne dein Zutun."
                            : "Erst einrichten, dann kann die Aufgabe automatisch laufen."}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={automated}
                      disabled={!configured}
                      onClick={() => setAutomated((v) => !v)}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                        automated ? "bg-accent" : "bg-surface-soft ring-1 ring-border",
                        !configured && "cursor-not-allowed opacity-50",
                      )}
                      aria-label="Automatisierung umschalten"
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                          automated ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
              {configured ? (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4" /> Zurücksetzen
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={onClose}>Abbrechen</Button>
              )}
              <Button variant="accent" size="sm" onClick={save} disabled={missingRequired}>
                <Check className="h-4 w-4" /> {configured ? "Speichern" : "Einrichten"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
