"use client";

import * as React from "react";
import {
  Phone, PhoneForwarded, PhoneOff, CalendarCheck, Voicemail, Settings2,
  Plus, Trash2, Save, Send, X, PhoneCall,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { employees, getEmployee } from "@/lib/data/employees";
import { loadItems, saveItems } from "@/lib/store-sync";
import {
  defaultPhoneSettings, voiceOptions, callSystemPrompt, emptyCall,
  PHONE_SETTINGS_ID, type PhoneSettings,
} from "@/lib/phone";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { CallRecord, ChatMessage } from "@/lib/types";

const outcomeMeta = {
  resolved: { label: "Gelöst", variant: "success" as const, icon: Phone },
  scheduled: { label: "Termin gebucht", variant: "accent" as const, icon: CalendarCheck },
  forwarded: { label: "Weitergeleitet", variant: "cyan" as const, icon: PhoneForwarded },
  voicemail: { label: "Voicemail", variant: "default" as const, icon: Voicemail },
};
const sentimentMeta = {
  positive: { label: "positiv", color: "text-success" },
  neutral: { label: "neutral", color: "text-muted" },
  negative: { label: "negativ", color: "text-danger" },
};
const outcomes = ["resolved", "scheduled", "forwarded", "voicemail"] as const;
const sentiments = ["positive", "neutral", "negative"] as const;

const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min`;
const inputCls =
  "h-10 w-full rounded-lg border border-border bg-surface-soft/50 px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";

export default function CallsPage() {
  const [settings, setSettings] = React.useState<PhoneSettings | null>(null);
  const [calls, setCalls] = React.useState<CallRecord[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      loadItems<PhoneSettings>("phone"),
      loadItems<CallRecord>("call"),
    ]).then(([ph, cl]) => {
      setSettings(ph[0] ?? defaultPhoneSettings(employees[0].id));
      setCalls(cl);
      setLoaded(true);
    });
  }, []);

  React.useEffect(() => {
    if (loaded && settings) void saveItems("phone", [settings]);
  }, [settings, loaded]);
  React.useEffect(() => {
    if (loaded) void saveItems("call", calls);
  }, [calls, loaded]);

  const agent = (settings && getEmployee(settings.agentId)) || employees[0];
  const scheduled = calls.filter((c) => c.outcome === "scheduled").length;

  const addCall = (c: CallRecord) => setCalls((prev) => [c, ...prev]);
  const updateCall = (id: string, patch: Partial<CallRecord>) =>
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCall = (id: string) => setCalls((prev) => prev.filter((c) => c.id !== id));

  if (!loaded || !settings) {
    return (
      <PageShell>
        <PageHeader title="Telefon-Assistent" description="Wird geladen…" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Telefon-Assistent"
        description="Konfiguriere deinen KI-Telefonassistenten, simuliere ein Gespräch und erfasse Anrufe."
      >
        <Button variant="outline" size="sm" onClick={() => setShowSettings((v) => !v)}>
          <Settings2 className="h-4 w-4" /> Stimme & Routing
        </Button>
      </PageHeader>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={(s) => { setSettings(s); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live status + simulator */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="relative grid h-20 w-20 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/20" />
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-success),var(--color-cyan))] text-white">
                  <Phone className="h-6 w-6" />
                </span>
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-ink">Leitung aktiv</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Avatar name={agent.name} color={agent.avatarColor} size="sm" /> {agent.name} nimmt Anrufe entgegen
              </p>
              <div className="mt-4 grid w-full grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-soft/60 p-3">
                  <p className="font-display text-xl font-semibold text-ink">{calls.length}</p>
                  <p className="text-xs text-muted">Erfasst</p>
                </div>
                <div className="rounded-xl bg-surface-soft/60 p-3">
                  <p className="font-display text-xl font-semibold text-ink">{scheduled}</p>
                  <p className="text-xs text-muted">Termine</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CallSimulator settings={settings} agentName={agent.name} />
        </div>

        {/* Call log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gesprächsprotokolle</CardTitle>
            <NewCallButton agentId={settings.agentId} onAdd={addCall} />
          </CardHeader>
          <CardContent className="space-y-3">
            {calls.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">
                Noch keine Anrufe erfasst. Simuliere oben ein Gespräch oder lege manuell ein Protokoll an.
              </p>
            ) : (
              calls.map((call) => (
                <CallRow key={call.id} call={call} onChange={updateCall} onRemove={removeCall} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function SettingsPanel({
  settings, onSave, onClose,
}: { settings: PhoneSettings; onSave: (s: PhoneSettings) => void; onClose: () => void }) {
  const [draft, setDraft] = React.useState<PhoneSettings>(settings);
  const set = (patch: Partial<PhoneSettings>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Card className="mt-4 border-accent/30">
      <CardHeader>
        <CardTitle>Telefon-Einstellungen</CardTitle>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink" aria-label="Schließen">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Wer nimmt Anrufe entgegen?</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {employees.map((e) => (
              <button
                key={e.id}
                onClick={() => set({ agentId: e.id })}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all",
                  draft.agentId === e.id ? "border-accent/60 bg-accent/8" : "border-border hover:border-accent/30",
                )}
              >
                <Avatar name={e.name} color={e.avatarColor} size="sm" />
                <span className="truncate text-sm text-ink">{e.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Begrüßung</label>
          <textarea
            value={draft.greeting}
            onChange={(e) => set({ greeting: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-surface-soft/50 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
            placeholder="Was der Assistent zu Beginn sagt…"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Weiterleiten an (Nummer)</label>
            <input value={draft.forwardNumber} onChange={(e) => set({ forwardNumber: e.target.value })} placeholder="+49 …" className={inputCls} inputMode="tel" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Stimme / Anbieter</label>
            <select value={draft.voice} onChange={(e) => set({ voice: e.target.value })} className={inputCls}>
              {voiceOptions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Erreichbar von</label>
            <input type="time" value={draft.hoursFrom} onChange={(e) => set({ hoursFrom: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Erreichbar bis</label>
            <input type="time" value={draft.hoursTo} onChange={(e) => set({ hoursTo: e.target.value })} className={inputCls} />
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-3.5 py-3">
          <span>
            <span className="block text-sm font-medium text-ink">Voicemail außerhalb der Zeiten</span>
            <span className="block text-xs text-muted">Nachricht aufnehmen, wenn niemand erreichbar ist.</span>
          </span>
          <button
            onClick={() => set({ voicemailEnabled: !draft.voicemailEnabled })}
            className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", draft.voicemailEnabled ? "bg-accent" : "bg-surface-soft")}
            role="switch" aria-checked={draft.voicemailEnabled} aria-label="Voicemail"
          >
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", draft.voicemailEnabled ? "translate-x-[22px]" : "translate-x-0.5")} />
          </button>
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Abbrechen</Button>
          <Button variant="accent" size="sm" onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString(), id: PHONE_SETTINGS_ID })}>
            <Save className="h-4 w-4" /> Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CallSimulator({ settings, agentName }: { settings: PhoneSettings; agentName: string }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const assistantId = crypto.randomUUID();
    const history = [...messages, userMsg];
    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "call",
          agentId: settings.agentId,
          systemPrompt: callSystemPrompt(settings, agentName),
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
      }
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: "⚠️ Verbindung unterbrochen." } : m)));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gespräch simulieren</CardTitle>
        <Badge variant="outline"><PhoneCall className="h-3 w-3" /> Test</Badge>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="max-h-64 space-y-2 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">
              Tippe, was ein Anrufer sagt – {agentName} antwortet wie am Telefon.
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" && "justify-end")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user" ? "bg-ink text-canvas" : "border border-border bg-surface text-ink",
                )}>
                  {m.content || "…"}
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="„Guten Tag, ich hätte gern…“"
            className={inputCls}
          />
          <Button type="submit" variant="accent" size="sm" disabled={!input.trim() || streaming} aria-label="Senden">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="mt-2 text-xs text-muted hover:text-ink">Gespräch zurücksetzen</button>
        )}
      </CardContent>
    </Card>
  );
}

function NewCallButton({ agentId, onAdd }: { agentId: string; onAdd: (c: CallRecord) => void }) {
  return (
    <Button variant="outline" size="sm" onClick={() => onAdd({ ...emptyCall(agentId), caller: "Neuer Anruf" })}>
      <Plus className="h-4 w-4" /> Anruf erfassen
    </Button>
  );
}

function CallRow({
  call, onChange, onRemove,
}: { call: CallRecord; onChange: (id: string, patch: Partial<CallRecord>) => void; onRemove: (id: string) => void }) {
  const [editing, setEditing] = React.useState(call.caller === "Neuer Anruf");
  const om = outcomeMeta[call.outcome];
  const sm = sentimentMeta[call.sentiment];
  const emp = getEmployee(call.employeeId);
  const OIcon = om.icon;

  if (editing) {
    return (
      <div className="rounded-xl border border-accent/30 bg-surface-soft/30 p-4 space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input value={call.caller} onChange={(e) => onChange(call.id, { caller: e.target.value })} placeholder="Anrufer (Name/Nummer)" className={inputCls} />
          <input
            type="number" min={0} value={Math.round(call.durationSec / 60)}
            onChange={(e) => onChange(call.id, { durationSec: Math.max(0, Number(e.target.value)) * 60 })}
            placeholder="Dauer (Minuten)" className={inputCls}
          />
          <select value={call.outcome} onChange={(e) => onChange(call.id, { outcome: e.target.value as CallRecord["outcome"] })} className={inputCls}>
            {outcomes.map((o) => <option key={o} value={o}>{outcomeMeta[o].label}</option>)}
          </select>
          <select value={call.sentiment} onChange={(e) => onChange(call.id, { sentiment: e.target.value as CallRecord["sentiment"] })} className={inputCls}>
            {sentiments.map((s) => <option key={s} value={s}>Stimmung: {sentimentMeta[s].label}</option>)}
          </select>
        </div>
        <textarea
          value={call.summary} onChange={(e) => onChange(call.id, { summary: e.target.value })}
          rows={2} placeholder="Zusammenfassung des Gesprächs…"
          className="w-full resize-none rounded-lg border border-border bg-surface-soft/50 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => onRemove(call.id)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-soft hover:text-danger" aria-label="Löschen">
            <Trash2 className="h-4 w-4" />
          </button>
          <Button variant="accent" size="sm" onClick={() => setEditing(false)} disabled={!call.caller.trim()}>
            <Save className="h-4 w-4" /> Fertig
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-soft/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-ink-soft">
            {call.outcome === "voicemail" ? <PhoneOff className="h-4 w-4" /> : <OIcon className="h-4 w-4" />}
          </span>
          <div>
            <p className="font-medium text-ink">{call.caller || "Unbekannt"}</p>
            <p className="text-xs text-muted">
              {fmtDuration(call.durationSec)} · Stimmung <span className={sm.color}>{sm.label}</span> · {formatRelativeTime(call.at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={om.variant}>{om.label}</Badge>
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-accent hover:underline">Bearbeiten</button>
        </div>
      </div>
      {call.summary && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{call.summary}</p>}
      {emp && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Avatar name={emp.name} color={emp.avatarColor} size="sm" /> bearbeitet von {emp.name}
        </div>
      )}
    </div>
  );
}
