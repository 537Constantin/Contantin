import { NextRequest, NextResponse } from "next/server";
import { RECEIPT_CATEGORIES } from "@/lib/receipts";

/**
 * Extracts structured fields from a photographed receipt/invoice via OpenAI
 * Vision.
 *
 * POST /api/receipts/extract  { image: <data-url> }
 *   -> { vendor, date, total, net, vatAmount, vatRate, currency, category, invoiceNumber }
 */
export const runtime = "nodejs";
export const maxDuration = 60;

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s ? s : null;
}

export async function POST(req: NextRequest) {
  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const image = body.image ?? "";
  if (!image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Kein gültiges Bild erhalten." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: "Demo-Modus: Ohne OPENAI_API_KEY kann der Beleg nicht gelesen werden.",
      demo: true,
    });
  }

  const system =
    "Du liest Belege und Rechnungen und gibst AUSSCHLIESSLICH JSON zurück mit den Feldern: " +
    "vendor (Händler/Firma), date (Rechnungsdatum als YYYY-MM-DD), total (Bruttobetrag als Zahl, Punkt als Dezimaltrenner), " +
    "net (Nettobetrag oder null), vatAmount (MwSt-Betrag oder null), vatRate (MwSt-Satz als Zahl in Prozent, z. B. 19, oder null), " +
    "currency (ISO, z. B. EUR), category (genau eine von: " + RECEIPT_CATEGORIES.join(", ") + "), " +
    "invoiceNumber (Rechnungsnummer oder null). Wenn ein Wert nicht klar lesbar ist, setze null. Erfinde nichts.";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 50000);
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: "Lies diesen Beleg und gib die Felder als JSON zurück." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
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

  const json = (await res.json().catch(() => null)) as
    | { choices?: { message?: { content?: string } }[] }
    | null;
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(json?.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return NextResponse.json({ error: "Beleg konnte nicht gelesen werden. Bitte schärferes Foto versuchen." }, { status: 502 });
  }

  const category = str(parsed.category) ?? "Sonstiges";
  return NextResponse.json({
    vendor: str(parsed.vendor) ?? "",
    date: str(parsed.date) ?? "",
    total: num(parsed.total),
    net: num(parsed.net),
    vatAmount: num(parsed.vatAmount),
    vatRate: num(parsed.vatRate),
    currency: str(parsed.currency) ?? "EUR",
    category: (RECEIPT_CATEGORIES as readonly string[]).includes(category) ? category : "Sonstiges",
    invoiceNumber: str(parsed.invoiceNumber),
  });
}
