"use client";

import * as React from "react";
import { Camera, Loader2, Plus, Download, Receipt as ReceiptIcon, Pencil } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptDialog } from "@/components/app/receipt-dialog";
import {
  fileToImageDataUrl, receiptsToCSV, fmtMoney, emptyDraft,
  type Receipt, type ReceiptDraft,
} from "@/lib/receipts";
import { loadItems, saveItems } from "@/lib/store-sync";
import { tapHaptic } from "@/lib/haptics";
import { formatRelativeTime } from "@/lib/utils";

export default function ReceiptsPage() {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [receipts, setReceipts] = React.useState<Receipt[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogInitial, setDialogInitial] = React.useState<(Partial<Receipt> & ReceiptDraft) | null>(null);

  React.useEffect(() => {
    void loadItems<Receipt>("receipt").then((r) => { setReceipts(r); setLoaded(true); });
  }, []);
  React.useEffect(() => {
    if (loaded) void saveItems("receipt", receipts);
  }, [receipts, loaded]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    tapHaptic();
    setBusy(true);
    setError("");
    try {
      const image = await fileToImageDataUrl(file);
      const res = await fetch("/api/receipts/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Konnte den Beleg nicht lesen. Bitte schärferes Foto versuchen.");
      } else {
        setDialogInitial({ ...emptyDraft(), ...json });
        setDialogOpen(true);
      }
    } catch {
      setError("Foto konnte nicht verarbeitet werden.");
    } finally {
      setBusy(false);
    }
  }

  function upsert(r: Receipt) {
    setReceipts((prev) => (prev.some((x) => x.id === r.id) ? prev.map((x) => (x.id === r.id ? r : x)) : [r, ...prev]));
  }
  function remove(id: string) {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  }

  function exportCSV() {
    tapHaptic();
    const csv = receiptsToCSV(receipts);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `belege-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const total = receipts.reduce((s, r) => s + (r.total ?? 0), 0);

  return (
    <PageShell>
      <PageHeader
        title="Belege & Rechnungen"
        description="Fotografiere einen Beleg – die KI liest Lieferant, Betrag, MwSt., Datum und Kategorie aus. Prüfen, speichern, als CSV für den Steuerberater exportieren."
      >
        {receipts.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" /> CSV
          </Button>
        )}
        <Button variant="accent" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {busy ? "Liest Beleg …" : "Beleg scannen"}
        </Button>
      </PageHeader>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }}
      />

      {error && <p className="mt-4 rounded-xl bg-warning/10 px-3 py-2.5 text-sm text-warning">{error}</p>}

      {/* Summary + manual add */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold text-ink">Erfasste Belege</h2>
          <Badge variant="default">{receipts.length}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {receipts.length > 0 && (
            <span className="text-sm text-muted">
              Summe: <span className="font-semibold text-ink">{fmtMoney(total)}</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setDialogInitial(emptyDraft()); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Manuell
          </Button>
        </div>
      </div>

      {receipts.length === 0 ? (
        <Card
          className="mt-4 cursor-pointer transition-colors hover:border-accent/40"
          onClick={() => fileRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-canvas">
              <Camera className="h-7 w-7" />
            </span>
            <p className="text-sm font-medium text-ink">Ersten Beleg scannen</p>
            <p className="max-w-xs text-xs text-muted">
              Am Handy öffnet sich direkt die Kamera. Am Rechner ein Foto/Scan hochladen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {receipts.map((r) => (
            <Card key={r.id} hover>
              <CardContent className="p-4">
                <button
                  className="flex w-full items-start gap-3 text-left"
                  onClick={() => { setDialogInitial(r); setDialogOpen(true); }}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-soft text-ink-soft">
                    <ReceiptIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-medium text-ink">{r.vendor}</p>
                      <span className="shrink-0 font-semibold text-ink">{fmtMoney(r.total, r.currency)}</span>
                    </div>
                    <p className="text-xs text-muted">
                      {r.date || "ohne Datum"}
                      {r.vatRate !== null ? ` · ${r.vatRate}% MwSt` : ""}
                      {r.createdAt ? ` · erfasst ${formatRelativeTime(r.createdAt)}` : ""}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="accent">{r.category}</Badge>
                      {r.invoiceNumber && <span className="text-[11px] text-muted">Nr. {r.invoiceNumber}</span>}
                      <Pencil className="ml-auto h-3.5 w-3.5 text-muted" />
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        Hinweis: Die KI-Auslesung ist eine Hilfe – bitte Beträge vor der Weitergabe an die Buchhaltung kurz prüfen.
      </p>

      <ReceiptDialog
        open={dialogOpen}
        initial={dialogInitial}
        onClose={() => setDialogOpen(false)}
        onSave={upsert}
        onDelete={remove}
      />
    </PageShell>
  );
}
