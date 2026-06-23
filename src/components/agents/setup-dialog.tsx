"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check, ArrowRight, Plug, Power } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  Capability,
  CapabilityState,
  IntegrationRequirement,
  SetupInput,
} from "@/lib/types";
import { getIntegration } from "@/lib/agents/integrations";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  capability: Capability | null;
  initialConfig?: Record<string, string>;
  missingIntegrations: IntegrationRequirement[];
  onClose: () => void;
  onSave: (state: CapabilityState) => void;
}

export function SetupDialog({
  open,
  capability,
  initialConfig,
  missingIntegrations,
  onClose,
  onSave,
}: Props) {
  const [step, setStep] = React.useState(0);
  const [config, setConfig] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open || !capability) return;
    setStep(0);
    // Seed defaults from the schema, then apply any saved config on top.
    const defaults: Record<string, string> = {};
    capability.setup.forEach((s) =>
      s.inputs?.forEach((i) => {
        if (i.defaultValue !== undefined) defaults[i.key] = i.defaultValue;
      }),
    );
    setConfig({ ...defaults, ...(initialConfig ?? {}) });
  }, [open, capability, initialConfig]);

  if (!capability) return null;

  const hasGate = missingIntegrations.length > 0;
  const stepsTotal = capability.setup.length + (hasGate ? 1 : 0) + 1; // gate + setup steps + review
  const gateOffset = hasGate ? 1 : 0;
  const isGate = hasGate && step === 0;
  const setupIndex = step - gateOffset;
  const isReview = step === stepsTotal - 1;

  const currentStep =
    !isGate && !isReview ? capability.setup[setupIndex] : undefined;

  const canAdvance = (() => {
    if (isGate) return false; // gated; user must connect integrations first
    if (!currentStep) return true;
    if (!currentStep.inputs) return true;
    return currentStep.inputs
      .filter((i) => i.required)
      .every((i) => (config[i.key] ?? "").trim().length > 0);
  })();

  const next = () => setStep((s) => Math.min(stepsTotal - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  function save() {
    onSave({ enabled: true, config, lastRunAt: new Date().toISOString() });
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
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-float)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Einrichten
                </p>
                <h2 className="font-display text-lg font-semibold text-ink">{capability.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex gap-1.5 px-6 pt-4">
              {Array.from({ length: stepsTotal }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-accent" : "bg-surface-soft",
                  )}
                />
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {isGate ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-ink">
                    Diese Aufgabe braucht Verbindungen, die noch fehlen:
                  </p>
                  <ul className="space-y-2">
                    {missingIntegrations.map((req, i) => {
                      if (typeof req === "string") {
                        const int = getIntegration(req);
                        if (!int) return null;
                        return (
                          <li
                            key={req}
                            className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft/40 p-3"
                          >
                            <span
                              className="grid h-9 w-9 place-items-center rounded-lg font-bold text-white"
                              style={{ background: int.color }}
                            >
                              {int.badge}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-ink">{int.name}</p>
                              <p className="text-xs text-muted">{int.unlocks}</p>
                            </div>
                            <Badge variant="warning">Nicht verbunden</Badge>
                          </li>
                        );
                      }
                      // Alternatives — user picks ONE.
                      return (
                        <li
                          key={i}
                          className="rounded-xl border border-border bg-surface-soft/40 p-3"
                        >
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warning">
                            Mindestens eines verbinden:
                          </p>
                          <div className="space-y-1.5">
                            {req.map((id) => {
                              const int = getIntegration(id);
                              if (!int) return null;
                              return (
                                <div key={id} className="flex items-center gap-3">
                                  <span
                                    className="grid h-7 w-7 place-items-center rounded-md text-xs font-bold text-white"
                                    style={{ background: int.color }}
                                  >
                                    {int.badge}
                                  </span>
                                  <span className="flex-1 text-sm text-ink">{int.name}</span>
                                  <span className="text-[11px] text-muted">{int.provider}</span>
                                </div>
                              );
                            })}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <Button asChild variant="accent" size="sm" className="mt-2">
                    <Link href="/integrations">
                      <Plug className="h-4 w-4" /> Zu den Integrationen
                    </Link>
                  </Button>
                </div>
              ) : isReview ? (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Check className="h-4 w-4 text-success" /> Bereit zur Aktivierung
                  </p>
                  <div className="rounded-xl border border-border bg-surface-soft/40 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Konfiguration
                    </p>
                    <dl className="space-y-1.5 text-sm">
                      {Object.entries(config)
                        .filter(([, v]) => String(v).trim().length > 0)
                        .map(([k, v]) => (
                          <div key={k} className="flex gap-3">
                            <dt className="w-32 shrink-0 text-muted">{k}</dt>
                            <dd className="min-w-0 flex-1 truncate text-ink">{String(v)}</dd>
                          </div>
                        ))}
                      {Object.values(config).every((v) => !String(v).trim()) && (
                        <p className="text-muted">Keine Konfiguration nötig.</p>
                      )}
                    </dl>
                  </div>
                  <p className="text-xs text-muted">
                    Nach der Aktivierung führt {capability.ownerRole} diese Aufgabe gemäß
                    Trigger („{capability.schedule ?? capability.trigger}“) aus.
                  </p>
                </div>
              ) : currentStep ? (
                <div className="space-y-4">
                  {currentStep.title && (
                    <p className="text-sm font-medium text-ink">{currentStep.title}</p>
                  )}
                  {currentStep.description && (
                    <p className="text-sm text-muted">{currentStep.description}</p>
                  )}
                  <div className="space-y-3">
                    {currentStep.inputs?.map((input) => (
                      <InputField
                        key={input.key}
                        input={input}
                        value={config[input.key] ?? ""}
                        onChange={(v) => setConfig((c) => ({ ...c, [input.key]: v }))}
                      />
                    ))}
                    {!currentStep.inputs && (
                      <p className="text-sm text-muted">
                        Keine zusätzlichen Eingaben nötig — klick auf Weiter.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <Button variant="ghost" size="sm" onClick={step === 0 ? onClose : back}>
                {step === 0 ? "Abbrechen" : "Zurück"}
              </Button>
              {isReview ? (
                <Button variant="accent" size="sm" onClick={save}>
                  <Power className="h-4 w-4" /> Aktivieren
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={next}
                  disabled={!canAdvance}
                >
                  Weiter <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InputField({
  input,
  value,
  onChange,
}: {
  input: SetupInput;
  value: string;
  onChange: (v: string) => void;
}) {
  const base =
    "h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {input.label}
        {input.required && <span className="ml-1 text-danger">*</span>}
      </span>
      {input.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={input.placeholder}
          rows={3}
          className={cn(base, "h-auto py-2.5")}
        />
      ) : input.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          {!input.required && <option value="">– Bitte wählen –</option>}
          {input.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={input.type === "number" ? "number" : input.type === "email" ? "email" : input.type === "time" ? "time" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={input.placeholder}
          className={base}
        />
      )}
      {input.hint && <span className="mt-1 block text-xs text-muted">{input.hint}</span>}
    </label>
  );
}
