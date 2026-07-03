import { NextRequest, NextResponse } from "next/server";
import type { EmailAnalysis, Priority } from "@/lib/inbox";

/**
 * Analyzes an incoming email via OpenAI and returns the structured JSON
 * contract: summary, priority, category, sentiment, language, tasks, dates,
 * invoiceOrOffer flag, and three reply suggestions.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const PRIORITIES: Priority[] = ["high", "medium", "low"];

export async function POST(req: NextRequest) {
  let body: { email?: string; subject?: string; from?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().slice(0, 12000);
  if (!email) return NextResponse.json({ error: "Kein E-Mail-Text." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Demo-Modus: Ohne OPENAI_API_KEY keine Analyse.", demo: true });

  const system =
    "Du bist ein E-Mail-Assistent. Analysiere die E-Mail und gib AUSSCHLIESSLICH valides JSON in genau diesem Format zurück: " +
    '{"summary": string (2-3 Sätze), "priority": "high"|"medium"|"low", "category": string (kurz, z. B. Anfrage, Angebot, Rechnung, Support, Info), ' +
    '"sentiment": string (z. B. positiv, neutral, negativ, verärgert), "language": string (z. B. Deutsch, Englisch), ' +
    '"tasks": Array von {"task": string, "deadline": string, "person": string} (falls Aufgaben/Bitten enthalten sind, sonst []), ' +
    '"dates": Array von {"date": string (YYYY-MM-DD falls möglich), "time": string, "description": string} (erwähnte Termine, sonst []), ' +
    '"invoiceOrOffer": boolean (true, wenn es um eine Rechnung oder ein Angebot geht), ' +
    '"replySuggestions": {"professional": string, "friendly": string, "short": string} (drei sinnvolle Antwort-Entwürfe in der Sprache der E-Mail)}. ' +
    "Erfinde nichts. Antworte in der Sprache der E-Mail.";

  const user =
    (body.from ? `Von: ${body.from}\n` : "") + (body.subject ? `Betreff: ${body.subject}\n\n` : "") + email;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 50000);
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = (err as Error)?.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Zeitüberschreitung – bitte erneut versuchen." : "Verbindung zur KI fehlgeschlagen." },
      { status: 502 },
    );
  }
  clearTimeout(timer);

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `OpenAI-Fehler ${res.status}: ${detail.slice(0, 160)}` }, { status: 502 });
  }

  const json = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
  let p: Record<string, unknown> = {};
  try {
    p = JSON.parse(json?.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return NextResponse.json({ error: "Analyse konnte nicht gelesen werden." }, { status: 502 });
  }

  const priority = (PRIORITIES as string[]).includes(String(p.priority)) ? (p.priority as Priority) : "medium";
  const rs = (p.replySuggestions ?? {}) as Record<string, unknown>;
  const result: EmailAnalysis = {
    summary: String(p.summary ?? "").trim(),
    priority,
    category: String(p.category ?? "Sonstiges").trim(),
    sentiment: String(p.sentiment ?? "neutral").trim(),
    language: String(p.language ?? "").trim(),
    tasks: Array.isArray(p.tasks)
      ? (p.tasks as Record<string, unknown>[]).slice(0, 10).map((t) => ({
          task: String(t.task ?? "").trim(),
          deadline: String(t.deadline ?? "").trim(),
          person: String(t.person ?? "").trim(),
        }))
      : [],
    dates: Array.isArray(p.dates)
      ? (p.dates as Record<string, unknown>[]).slice(0, 10).map((d) => ({
          date: String(d.date ?? "").trim(),
          time: String(d.time ?? "").trim(),
          description: String(d.description ?? "").trim(),
        }))
      : [],
    invoiceOrOffer: Boolean(p.invoiceOrOffer),
    replySuggestions: {
      professional: String(rs.professional ?? "").trim(),
      friendly: String(rs.friendly ?? "").trim(),
      short: String(rs.short ?? "").trim(),
    },
  };

  return NextResponse.json(result);
}
