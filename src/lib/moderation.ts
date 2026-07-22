/**
 * Content-moderation model shared by the API route and the live dashboard.
 * Wraps OpenAI's free omni-moderation model (images + text) into a simple
 * verdict: safe / warning / blocked, plus the categories that triggered it.
 */

export type Verdict = "safe" | "warning" | "blocked";

export interface CategoryResult {
  key: string;
  label: string;
  score: number;
  flagged: boolean;
}

export interface ModerationResult {
  verdict: Verdict;
  flagged: boolean;
  maxScore: number;
  top: CategoryResult[];
}

/** Human-readable German labels for OpenAI's moderation categories. */
export const CATEGORY_LABELS: Record<string, string> = {
  sexual: "Sexuell / NSFW",
  "sexual/minors": "Sexuell (Minderjährige)",
  harassment: "Belästigung",
  "harassment/threatening": "Belästigung (bedrohlich)",
  hate: "Hass",
  "hate/threatening": "Hass (bedrohlich)",
  "self-harm": "Selbstverletzung",
  "self-harm/intent": "Selbstverletzung (Absicht)",
  "self-harm/instructions": "Selbstverletzung (Anleitung)",
  violence: "Gewalt",
  "violence/graphic": "Gewalt (grafisch)",
  illicit: "Illegale Handlungen",
  "illicit/violent": "Illegale Handlungen (gewalttätig)",
};

// High-severity categories that force a hard block once clearly present.
export const SEVERE = new Set([
  "sexual",
  "sexual/minors",
  "violence/graphic",
  "self-harm",
  "self-harm/intent",
  "self-harm/instructions",
  "illicit/violent",
  "hate/threatening",
  "harassment/threatening",
]);

const BLOCK_SCORE = 0.5;
const WARN_SCORE = 0.3;

/** Turn OpenAI's category maps into our normalized result. */
export function toModerationResult(
  categories: Record<string, boolean>,
  scores: Record<string, number>,
  flagged: boolean,
): ModerationResult {
  const list: CategoryResult[] = Object.keys(scores).map((key) => ({
    key,
    label: CATEGORY_LABELS[key] ?? key,
    score: scores[key] ?? 0,
    flagged: Boolean(categories[key]),
  }));
  list.sort((a, b) => b.score - a.score);

  const maxScore = list.length ? list[0].score : 0;
  const severeHit = list.some((c) => SEVERE.has(c.key) && (c.flagged || c.score >= BLOCK_SCORE));

  let verdict: Verdict = "safe";
  if (severeHit) verdict = "blocked";
  else if (flagged || maxScore >= WARN_SCORE) verdict = "warning";

  // Return the full sorted list so the client can re-judge at its own
  // sensitivity; the UI only displays the top few.
  return { verdict, flagged, maxScore, top: list };
}

export type Sensitivity = "low" | "medium" | "high";

export const SENSITIVITY_META: Record<Sensitivity, { label: string; warn: number; block: number }> = {
  low: { label: "Niedrig", warn: 0.5, block: 0.7 },
  medium: { label: "Mittel", warn: 0.3, block: 0.5 },
  high: { label: "Hoch", warn: 0.15, block: 0.35 },
};

/** Re-judge a result at a chosen sensitivity (client-side, live-adjustable). */
export function verdictAt(top: CategoryResult[], flagged: boolean, sensitivity: Sensitivity): Verdict {
  const th = SENSITIVITY_META[sensitivity];
  const severeHit = top.some((c) => SEVERE.has(c.key) && (c.flagged || c.score >= th.block));
  const maxScore = top.reduce((m, c) => Math.max(m, c.score), 0);
  if (severeHit) return "blocked";
  if (flagged || maxScore >= th.warn) return "warning";
  return "safe";
}

export const VERDICT_META: Record<Verdict, { label: string; cls: string; dot: string }> = {
  safe: { label: "Sicher", cls: "bg-success/12 text-success ring-1 ring-success/25", dot: "bg-success" },
  warning: { label: "Warnung", cls: "bg-warning/14 text-warning ring-1 ring-warning/25", dot: "bg-warning" },
  blocked: { label: "Blockiert", cls: "bg-danger/12 text-danger ring-1 ring-danger/25", dot: "bg-danger" },
};
