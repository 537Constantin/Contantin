"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUp, Sparkles, ChevronDown, Square, Paperclip, Mic } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/app/status";
import { ChatMarkdown } from "@/components/app/chat-markdown";
import { employees } from "@/lib/data/employees";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

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

  const agent = employees.find((e) => e.id === agentId) ?? employees[0];

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

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
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
                <Sparkles className="h-8 w-8 text-white" />
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
                      <p className="text-[15px] leading-relaxed">{m.content}</p>
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-soft)] focus-within:border-accent/40"
        >
          <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-soft hover:text-ink" aria-label="Datei anhängen">
            <Paperclip className="h-[18px] w-[18px]" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
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
              disabled={!input.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-accent),var(--color-cyan))] text-white transition-opacity disabled:opacity-40"
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
