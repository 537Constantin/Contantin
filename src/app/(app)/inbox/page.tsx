"use client";

import * as React from "react";
import {
  Inbox, RefreshCw, Loader2, ArrowLeft, Sparkles, Send, Plug, Unplug,
  Mail, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmailAnalysisPanel } from "@/components/app/email-analysis-panel";
import {
  MAIL_PROVIDERS, type InboxMessage, type FullMessage, type EmailAnalysis,
} from "@/lib/inbox";
import { tapHaptic } from "@/lib/haptics";
import { formatRelativeTime, cn } from "@/lib/utils";

type Phase = "loading" | "notready" | "connect" | "ready";
const inputCls =
  "h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";

export default function InboxPage() {
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [account, setAccount] = React.useState("");
  const [messages, setMessages] = React.useState<InboxMessage[]>([]);
  const [listLoading, setListLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<FullMessage | null>(null);
  const [opening, setOpening] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<EmailAnalysis | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [googleReady, setGoogleReady] = React.useState(false);
  const [microsoftReady, setMicrosoftReady] = React.useState(false);
  const [reply, setReply] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sendMsg, setSendMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const loadStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/inbox/status", { cache: "no-store" });
      const j = await res.json();
      setGoogleReady(Boolean(j.googleReady));
      setMicrosoftReady(Boolean(j.microsoftReady));
      if (j.connected) {
        setAccount(j.email ?? "");
        setPhase("ready");
        void loadMessages();
      } else setPhase(j.ready ? "connect" : "notready");
    } catch {
      setPhase("notready");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle the return trip from Google's OAuth consent screen.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mailerror = params.get("mailerror");
    if (mailerror) setError(mailerror);
    if (mailerror || params.get("connected")) {
      window.history.replaceState({}, "", "/inbox");
    }
  }, []);

  React.useEffect(() => { void loadStatus(); }, [loadStatus]);

  async function loadMessages() {
    setListLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inbox/fetch?limit=25", { cache: "no-store" });
      const j = await res.json();
      if (j.error === "not-connected") return setPhase("connect");
      if (!res.ok) setError(j.error ?? "Abruf fehlgeschlagen.");
      else setMessages(j.messages ?? []);
    } catch {
      setError("Verbindung fehlgeschlagen.");
    } finally {
      setListLoading(false);
    }
  }

  async function openMessage(uid: number) {
    tapHaptic();
    setOpening(true);
    setSelected(null);
    setAnalysis(null);
    setReply("");
    setSendMsg(null);
    setError("");
    try {
      const res = await fetch(`/api/inbox/message?uid=${uid}`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) setError(j.error ?? "Nachricht konnte nicht geladen werden.");
      else setSelected(j.message);
    } catch {
      setError("Verbindung fehlgeschlagen.");
    } finally {
      setOpening(false);
    }
  }

  async function analyze() {
    if (!selected || analyzing) return;
    tapHaptic();
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/email/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected.text, subject: selected.subject, from: selected.from }),
      });
      const j = await res.json();
      if (!res.ok || j.error) setError(j.error ?? "Analyse fehlgeschlagen.");
      else setAnalysis(j);
    } catch {
      setError("Verbindung fehlgeschlagen.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim() || sending) return;
    tapHaptic(12);
    setSending(true);
    setSendMsg(null);
    const subject = selected.subject.replace(/^\s*(re:\s*)+/i, "");
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.fromAddress, subject: `Re: ${subject}`, text: reply }),
      });
      const j = await res.json();
      setSendMsg(j?.ok ? { ok: true, text: `Antwort an ${selected.fromAddress} verschickt.` } : { ok: false, text: j?.error ?? "Versand fehlgeschlagen." });
    } catch {
      setSendMsg({ ok: false, text: "Verbindung fehlgeschlagen." });
    } finally {
      setSending(false);
    }
  }

  async function disconnect() {
    tapHaptic();
    await fetch("/api/inbox/disconnect", { method: "POST" });
    setMessages([]);
    setSelected(null);
    setPhase("connect");
  }

  return (
    <PageShell>
      <PageHeader title="Posteingang" description="Verbinde dein Postfach – die KI liest neue E-Mails, fasst sie zusammen, erkennt Aufgaben & Termine und schlägt Antworten vor.">
        {phase === "ready" && (
          <>
            <Button variant="outline" size="sm" onClick={loadMessages} disabled={listLoading}>
              {listLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Aktualisieren
            </Button>
            <Button variant="ghost" size="sm" onClick={disconnect}>
              <Unplug className="h-4 w-4" /> Trennen
            </Button>
          </>
        )}
      </PageHeader>

      {error && <p className="mt-4 flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2.5 text-sm text-warning"><AlertTriangle className="h-4 w-4 shrink-0" /> {error}</p>}

      {phase === "loading" && <div className="mt-10 flex justify-center text-muted"><Loader2 className="h-6 w-6 animate-spin" /></div>}

      {phase === "notready" && (
        <Card className="mt-4"><CardContent className="py-10 text-center text-sm text-muted">
          Posteingang ist serverseitig noch nicht bereit. Es fehlt ein Verschlüsselungs-Schlüssel (<code>CRON_SECRET</code> oder <code>MAIL_ENCRYPTION_KEY</code>) in Vercel.
        </CardContent></Card>
      )}

      {phase === "connect" && <ConnectForm onConnected={loadStatus} googleReady={googleReady} microsoftReady={microsoftReady} />}

      {phase === "ready" && (
        <div className="mt-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs text-muted"><Mail className="h-3.5 w-3.5" /> Verbunden: <span className="font-medium text-ink">{account}</span></p>

          {selected ? (
            <MessageDetail
              message={selected}
              onBack={() => { setSelected(null); setAnalysis(null); }}
              analysis={analysis}
              analyzing={analyzing}
              onAnalyze={analyze}
              reply={reply}
              setReply={setReply}
              onSend={sendReply}
              sending={sending}
              sendMsg={sendMsg}
            />
          ) : opening ? (
            <div className="flex justify-center py-10 text-muted"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : messages.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted">{listLoading ? "Lädt …" : "Keine Nachrichten gefunden."}</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => (
                <button
                  key={m.uid}
                  onClick={() => openMessage(m.uid)}
                  className="tap flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-3.5 text-left transition-colors hover:border-accent/30 hover:bg-surface-soft/40"
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", m.seen ? "bg-transparent ring-1 ring-border" : "bg-accent")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-sm", m.seen ? "text-ink-soft" : "font-semibold text-ink")}>{m.from}</p>
                      <span className="shrink-0 text-[11px] text-muted">{formatRelativeTime(m.date)}</span>
                    </div>
                    <p className="truncate text-sm text-ink">{m.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

function MessageDetail({
  message, onBack, analysis, analyzing, onAnalyze, reply, setReply, onSend, sending, sendMsg,
}: {
  message: FullMessage;
  onBack: () => void;
  analysis: EmailAnalysis | null;
  analyzing: boolean;
  onAnalyze: () => void;
  reply: string;
  setReply: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  sendMsg: { ok: boolean; text: string } | null;
}) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Posteingang
      </button>

      <Card>
        <CardContent className="p-5">
          <p className="font-display text-lg font-semibold text-ink">{message.subject}</p>
          <p className="mt-0.5 text-sm text-muted">{message.from} · {new Date(message.date).toLocaleString("de-DE")}</p>
          <div className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-soft/40 p-3 text-[13px] leading-relaxed text-ink-soft">
            {message.text || "(kein Textinhalt)"}
          </div>
          <Button variant="accent" size="sm" className="mt-3" onClick={onAnalyze} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Analysiert …" : "KI-Analyse"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <EmailAnalysisPanel analysis={analysis} onUseReply={(t) => setReply(t)} />
      )}

      {/* Reply */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Send className="h-4 w-4 text-accent" /> Antwort an {message.fromAddress || message.from}</p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={6}
            placeholder="Antwort schreiben – oder oben einen Vorschlag übernehmen …"
            className="w-full resize-y rounded-xl border border-border bg-surface-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
          />
          <Button variant="accent" size="sm" onClick={onSend} disabled={sending || !reply.trim() || !message.fromAddress}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sendet …" : "Antwort senden"}
          </Button>
          {!message.fromAddress && <p className="text-xs text-muted">Keine Absender-Adresse erkannt – Antwort nicht möglich.</p>}
          {sendMsg && (
            <p className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm", sendMsg.ok ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
              {sendMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {sendMsg.text}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectForm({
  onConnected, googleReady, microsoftReady,
}: {
  onConnected: () => void;
  googleReady: boolean;
  microsoftReady: boolean;
}) {
  const hasOAuth = googleReady || microsoftReady;
  const [providerId, setProviderId] = React.useState(MAIL_PROVIDERS[0].id);
  const provider = MAIL_PROVIDERS.find((p) => p.id === providerId) ?? MAIL_PROVIDERS[0];
  const [host, setHost] = React.useState(provider.host);
  const [port, setPort] = React.useState(provider.port);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  function pickProvider(id: string) {
    setProviderId(id);
    const p = MAIL_PROVIDERS.find((x) => x.id === id);
    if (p) { setHost(p.host); setPort(p.port); }
  }

  async function connect() {
    if (busy) return;
    tapHaptic();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/inbox/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, port, email, password }),
      });
      const j = await res.json();
      if (j.ok) onConnected();
      else setError(j.error ?? "Verbindung fehlgeschlagen.");
    } catch {
      setError("Verbindung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-5">
      <CardContent className="space-y-4 p-5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Plug className="h-4 w-4 text-accent" /> Postfach verbinden</p>

        {hasOAuth && (
          <>
            <div className="space-y-2">
              {microsoftReady && (
                <button
                  onClick={() => { tapHaptic(); window.location.href = "/api/inbox/oauth/microsoft"; }}
                  className="tap flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-surface-soft/60"
                >
                  <MicrosoftIcon /> Mit Microsoft anmelden
                </button>
              )}
              {googleReady && (
                <button
                  onClick={() => { tapHaptic(); window.location.href = "/api/inbox/oauth/google"; }}
                  className="tap flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-surface-soft/60"
                >
                  <GoogleIcon /> Mit Google anmelden
                </button>
              )}
            </div>
            <p className="text-center text-xs text-muted">Für Outlook, Microsoft 365 & Gmail – ein Klick, kein App-Passwort.</p>
            <div className="flex items-center gap-3 py-1 text-xs text-muted">
              <span className="h-px flex-1 bg-border" /> oder manuell (IMAP) <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-1.5">
          {MAIL_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => pickProvider(p.id)}
              className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors", providerId === p.id ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink")}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-surface-soft/40 p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">So verbindest du {provider.label}</p>
          <ol className="space-y-1.5">
            {provider.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-soft">
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-ink">IMAP-Server</span>
            <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="imap.beispiel.de" className={inputCls} />
          </label>
          <label className="block"><span className="mb-1.5 block text-xs font-medium text-ink">Port</span>
            <input type="number" value={port} onChange={(e) => setPort(Number(e.target.value) || 993)} className={inputCls} />
          </label>
        </div>
        <label className="block"><span className="mb-1.5 block text-xs font-medium text-ink">E-Mail-Adresse</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@firma.de" className={inputCls} />
        </label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium text-ink">{provider.passwordLabel}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={provider.passwordLabel} className={inputCls} />
        </label>

        <p className="flex items-start gap-1.5 text-xs text-muted">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Dein Passwort wird <span className="font-medium text-ink">verschlüsselt</span> gespeichert und nur zum Abrufen deiner E-Mails genutzt.
        </p>

        {error && <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">{error}</p>}

        <Button variant="accent" onClick={connect} disabled={busy || !host || !email || !password} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Inbox className="h-4 w-4" />}
          {busy ? "Verbinde & prüfe Login …" : "Verbinden"}
        </Button>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}
