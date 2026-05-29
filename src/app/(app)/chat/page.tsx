"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUp, Sparkles, ChevronDown, Square, Paperclip, Mic, X, FileText } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/app/status";
import { ChatMarkdown } from "@/components/app/chat-markdown";
import { employees } from "@/lib/data/employees";
import { loadGraphs } from "@/lib/graphs";
import { kindFromFile, readTextFile, extractTextFromFile, formatBytes, loadUserDocuments, MAX_TEXT_CHARS } from "@/lib/files";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

type Attachment = NonNullable<ChatMessage["attachment"]>;

const suggestions = [
  "Fasse meine Termine für morgen zusammen",
  "Welche Kunden brauchen ein Follow-up?",
  "Erstelle einen Report über offene Tickets",
  "Wo verlieren wir die meisten Leads?",
];

export default function ChatPage() {
  return (
    <React.Suspense>
      <ChatView />
    </React.Suspense>
  );
}

function ChatView() {
  const params = useSearchParams();
  const initialAgent = params.get("agent") ?? employees[0].id;
  const [agentId, setAgentId] = React.useState(initialAgent);
  const [picker, setPicker] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = React.useState<Attachment | null>(null);
  const [fileNote, setFileNote] = React.useState<string | null>(null);

  const agent = employees.find((e) => e.id === agentId) ?? employees[0];

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Auto-send a prompt passed from another page (e.g. "In Terminplan umwandeln").
  const didInit = React.useRef(false);
  React.useEffect(() => {
    if (didInit.current) return;
    const prompt = params.get("prompt");
    const docId = params.get("doc");
    if (!prompt && !docId) return;
    didInit.current = true;

    // A "doc" param means we were sent here from the documents library — load
    // that document and attach it so the agent can actually read it.
    let file: Attachment | undefined;
    if (docId) {
      const doc = loadUserDocuments().find((d) => d.id === docId);
      if (doc) file = { name: doc.name, sizeKb: doc.sizeKb, text: doc.text };
    }
    void send(prompt ?? `Fasse die angehängte Datei „${file?.name ?? ""}" zusammen.`, file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function send(text: string, file?: Attachment) {
    const content = text.trim();
    if ((!content && !file) || streaming) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content, attachment: file };
    const assistantId = crypto.randomUUID();
    const history = [...messages, userMsg];
    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setAttachment(null);
    setFileNote(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          messages: history.map((m) => ({
            role: m.role,
            content: m.attachment?.text
              ? `${m.content}\n\n--- Angehängte Datei „${m.attachment.name}" ---\n${m.attachment.text}`
              : m.content,
          })),
          graphs: loadGraphs(),
        }),
        signal: controller.signal,
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
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: "⚠️ Verbindung unterbrochen. Bitte erneut versuchen." } : m,
          ),
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the user pick the same file again later
    if (!file) return;
    setFileNote(null);
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    const kind = kindFromFile(file);

    if (kind === "text") {
      try {
        const text = await readTextFile(file);
        setAttachment({ name: file.name, sizeKb, text: text.slice(0, MAX_TEXT_CHARS) });
        if (text.length > MAX_TEXT_CHARS) {
          setFileNote("Große Datei – nur der Anfang wird an die KI übergeben.");
        }
      } catch {
        setFileNote("Diese Datei konnte nicht gelesen werden.");
      }
    } else if (kind === "pdf" || kind === "docx") {
      setFileNote("Lese Datei …");
      const text = await extractTextFromFile(file);
      if (text) {
        setAttachment({ name: file.name, sizeKb, text });
        setFileNote(null);
      } else {
        setAttachment({ name: file.name, sizeKb, text: null });
        setFileNote("Konnte keinen Text lesen (evtl. gescanntes PDF oder zu groß). Datei ist als Referenz angehängt.");
      }
    } else {
      // Image / other: attach as a reference only.
      setAttachment({ name: file.name, sizeKb, text: null });
      setFileNote("Angehängt als Referenz. Automatisch lesen kann die KI Text-, PDF- und Word-Dateien; Bilder folgen.");
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Agent header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="relative">
          <button
            onClick={() => setPicker((p) => !p)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-surface-soft"
          >
            <Avatar name={agent.name} color={agent.avatarColor} glow />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{agent.name}</span>
                <StatusDot status={agent.status} />
              </div>
              <span className="text-xs text-muted">{agent.roleLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
          {picker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPicker(false)} />
              <div className="absolute left-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-float)]">
                {employees.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setAgentId(e.id);
                      setPicker(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-surface-soft",
                      e.id === agentId && "bg-surface-soft",
                    )}
                  >
                    <Avatar name={e.name} color={e.avatarColor} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{e.name}</p>
                      <p className="truncate text-xs text-muted">{e.roleLabel}</p>
                    </div>
                    <StatusDot status={e.status} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-sm text-muted hover:text-ink">
            Neuer Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {empty ? (
            <div className="flex flex-col items-center justify-center pt-10 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent),var(--color-cyan))] shadow-[var(--shadow-glow)]">
                <Sparkles className="h-8 w-8 text-canvas" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
                Wie kann {agent.name} dir helfen?
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Stelle eine Frage oder delegiere eine Aufgabe. {agent.name} hat Zugriff auf Gedächtnis, Tools und deine Daten.
              </p>
              <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-ink-soft transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  {m.role === "assistant" ? (
                    <Avatar name={agent.name} color={agent.avatarColor} size="sm" />
                  ) : (
                    <Avatar name="Constantin Weber" color="#7c6dff" size="sm" />
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-3",
                      m.role === "user"
                        ? "bg-ink text-canvas"
                        : "border border-border bg-surface text-ink",
                    )}
                  >
                    {m.role === "assistant" && m.content === "" ? (
                      <span className="flex gap-1 py-1">
                        <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                      </span>
                    ) : m.role === "assistant" ? (
                      <ChatMarkdown content={m.content} />
                    ) : (
                      <div>
                        {m.attachment && (
                          <div className="mb-1.5 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-canvas/15 px-2 py-1 text-xs">
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{m.attachment.name}</span>
                          </div>
                        )}
                        {m.content && <p className="text-[15px] leading-relaxed">{m.content}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border px-4 py-4 sm:px-6">
        {(attachment || fileNote) && (
          <div className="mx-auto mb-2 w-full max-w-3xl">
            {attachment && (
              <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink">
                <FileText className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="max-w-[220px] truncate">{attachment.name}</span>
                <span className="shrink-0 text-muted">{formatBytes(attachment.sizeKb * 1024)}</span>
                {attachment.text === null && <span className="shrink-0 text-warning">· nur Referenz</span>}
                <button
                  type="button"
                  onClick={() => { setAttachment(null); setFileNote(null); }}
                  className="ml-0.5 shrink-0 text-muted hover:text-danger"
                  aria-label="Anhang entfernen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {fileNote && <p className="mt-1 text-xs text-warning">{fileNote}</p>}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input, attachment ?? undefined);
          }}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-soft)] focus-within:border-accent/40"
        >
          <input ref={fileInputRef} type="file" className="sr-only" onChange={onPickFile} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-soft hover:text-ink"
            aria-label="Datei anhängen"
          >
            <Paperclip className="h-[18px] w-[18px]" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input, attachment ?? undefined);
              }
            }}
            rows={1}
            placeholder={`Nachricht an ${agent.name}…`}
            className="max-h-40 flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] text-ink placeholder:text-muted focus:outline-none"
          />
          <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-soft hover:text-ink" aria-label="Spracheingabe">
            <Mic className="h-[18px] w-[18px]" />
          </button>
          {streaming ? (
            <button
              type="button"
              onClick={stop}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-soft text-ink hover:bg-border"
              aria-label="Stoppen"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() && !attachment}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-canvas transition-opacity disabled:opacity-40"
              aria-label="Senden"
            >
              <ArrowUp className="h-[18px] w-[18px]" />
            </button>
          )}
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted">
          AI Workforce OS kann Fehler machen. Wichtige Informationen bitte prüfen.
        </p>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-2 w-2 animate-pulse-soft rounded-full bg-muted"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}
