"use client";

import * as React from "react";
import { Sparkles, Send, Loader2, CheckCircle2, AlertTriangle, Mail, Wand2 } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tapHaptic } from "@/lib/haptics";

const tones = ["professionell", "freundlich", "verbindlich", "locker"];

type Status =
  | { kind: "idle" }
  | { kind: "ok"; msg: string }
  | { kind: "err"; msg: string };

export default function EmailPage() {
  const [to, setTo] = React.useState("");
  const [recipientName, setRecipientName] = React.useState("");
  const [senderName, setSenderName] = React.useState("");
  const [brief, setBrief] = React.useState("");
  const [tone, setTone] = React.useState(tones[0]);

  const [subject, setSubject] = React.useState("");
  const [text, setText] = React.useState("");

  const [drafting, setDrafting] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });

  const hasDraft = subject.trim() !== "" || text.trim() !== "";

  async function draft() {
    if (!brief.trim() || drafting) return;
    tapHaptic();
    setDrafting(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/email/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, tone, recipientName, senderName }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus({ kind: "err", msg: json?.error ?? "Entwurf fehlgeschlagen." });
      } else {
        setSubject(json.subject ?? "");
        setText(json.body ?? "");
      }
    } catch {
      setStatus({ kind: "err", msg: "Verbindung fehlgeschlagen. Bitte erneut versuchen." });
    } finally {
      setDrafting(false);
    }
  }

  async function send() {
    if (sending) return;
    tapHaptic(12);
    setSending(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text }),
      });
      const json = await res.json();
      if (json?.ok) {
        setStatus({ kind: "ok", msg: `E-Mail an ${to} wurde verschickt.` });
      } else {
        setStatus({ kind: "err", msg: json?.error ?? "Versand fehlgeschlagen." });
      }
    } catch {
      setStatus({ kind: "err", msg: "Verbindung fehlgeschlagen. Bitte erneut versuchen." });
    } finally {
      setSending(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="KI-E-Mail"
        description="Beschreibe kurz dein Anliegen – die KI schreibt eine fertige E-Mail, du prüfst sie und verschickst sie wirklich."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-success/20">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Echter Versand
        </span>
      </PageHeader>

      {/* Honest note about the Resend domain limit */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-surface-soft/40 p-3.5 text-sm text-ink-soft">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Ohne verifizierte Absender-Domain stellt Resend nur an <span className="font-medium text-ink">deine eigene
          Resend-Adresse</span> zu – ideal für den ersten Test. Für den Versand an beliebige Empfänger eine Domain in
          Resend verifizieren und <code>RESEND_FROM</code> setzen.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Brief */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Wand2 className="h-4 w-4 text-accent" /> 1 · Anliegen
            </p>
            <Field label="Empfänger (E-Mail)">
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="name@firma.de"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Empfänger-Name (optional)">
                <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="z. B. Frau Müller" className={inputCls} />
              </Field>
              <Field label="Dein Name (optional)">
                <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="z. B. Constantin" className={inputCls} />
              </Field>
            </div>
            <Field label="Worum geht's?">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder="z. B. Follow-up nach dem Angebot von letzter Woche, freundlich nachfassen und einen Termin vorschlagen."
                className={taCls + " resize-y"}
              />
            </Field>
            <Field label="Tonalität">
              <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputCls}>
                {tones.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </Field>
            <Button variant="accent" onClick={draft} disabled={!brief.trim() || drafting} className="w-full">
              {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {drafting ? "Schreibt …" : "Entwurf mit KI erstellen"}
            </Button>
          </CardContent>
        </Card>

        {/* Draft + send */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Send className="h-4 w-4 text-accent" /> 2 · Prüfen &amp; senden
            </p>
            {!hasDraft ? (
              <div className="grid place-items-center rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted">
                <Sparkles className="mb-2 h-6 w-6 text-muted" />
                Dein Entwurf erscheint hier. Fülle links das Anliegen aus und klick auf „Entwurf erstellen“.
              </div>
            ) : (
              <>
                <Field label="Betreff">
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Text">
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className={taCls + " resize-y"} />
                </Field>
                <Button variant="accent" onClick={send} disabled={sending || !to.trim() || !subject.trim() || !text.trim()} className="w-full">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Wird gesendet …" : "Jetzt senden"}
                </Button>
              </>
            )}

            {status.kind === "ok" && (
              <div className="flex items-start gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {status.msg}
              </div>
            )}
            {status.kind === "err" && (
              <div className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2.5 text-sm text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {status.msg}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";
const taCls =
  "w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
