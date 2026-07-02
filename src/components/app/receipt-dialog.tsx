"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RECEIPT_CATEGORIES, type Receipt, type ReceiptDraft } from "@/lib/receipts";
import { tapHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const rid = () => Math.random().toString(36).slice(2, 9);

export function ReceiptDialog({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  initial: (Partial<Receipt> & ReceiptDraft) | null;
  onClose: () => void;
  onSave: (r: Receipt) => void;
  onDelete?: (id: string) => void;
}) {
  const editing = Boolean(initial?.id);
  const [d, setD] = React.useState<ReceiptDraft | null>(null);

  React.useEffect(() => {
    if (open && initial) setD({ ...initial });
  }, [open, initial]);

  if (!open || !d) return null;

  function set<K extends keyof ReceiptDraft>(key: K, value: ReceiptDraft[K]) {
    setD((prev) => (prev ? { ...prev, [key]: value } : prev));
  }
  const numChange = (key: keyof ReceiptDraft) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(",", ".");
    set(key, (v === "" ? null : Number(v)) as ReceiptDraft[typeof key]);
  };

  function save() {
    if (!d) return;
    tapHaptic(12);
    onSave({
      id: initial?.id ?? rid(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      ...d,
      vendor: d.vendor.trim() || "Unbekannt",
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog" aria-modal
            className="pb-safe relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-float)] sm:max-w-md sm:rounded-[var(--radius-card)] sm:pb-0"
            initial={{ opacity: 0, y: 48, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">{editing ? "Beleg bearbeiten" : "Beleg prüfen"}</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink" aria-label="Schließen">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3.5 overflow-y-auto px-6 py-5">
              <Field label="Lieferant">
                <input value={d.vendor} onChange={(e) => set("vendor", e.target.value)} className={inputCls} placeholder="z. B. Bürobedarf GmbH" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Datum">
                  <input type="date" value={d.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Kategorie">
                  <select value={d.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                    {RECEIPT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Betrag (brutto)">
                  <input type="number" inputMode="decimal" step="0.01" value={d.total ?? ""} onChange={numChange("total")} className={inputCls} placeholder="0,00" />
                </Field>
                <Field label="Währung">
                  <input value={d.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} className={inputCls} placeholder="EUR" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Netto">
                  <input type="number" inputMode="decimal" step="0.01" value={d.net ?? ""} onChange={numChange("net")} className={inputCls} />
                </Field>
                <Field label="MwSt €">
                  <input type="number" inputMode="decimal" step="0.01" value={d.vatAmount ?? ""} onChange={numChange("vatAmount")} className={inputCls} />
                </Field>
                <Field label="MwSt %">
                  <input type="number" inputMode="decimal" step="1" value={d.vatRate ?? ""} onChange={numChange("vatRate")} className={inputCls} />
                </Field>
              </div>
              <Field label="Rechnungsnr. (optional)">
                <input value={d.invoiceNumber ?? ""} onChange={(e) => set("invoiceNumber", e.target.value || null)} className={inputCls} />
              </Field>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
              {editing && onDelete ? (
                <Button variant="ghost" size="sm" onClick={() => { tapHaptic(); onDelete(initial!.id!); onClose(); }}>
                  <Trash2 className="h-4 w-4" /> Löschen
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={onClose}>Abbrechen</Button>
              )}
              <Button variant="accent" size="sm" onClick={save}>
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
  "h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
