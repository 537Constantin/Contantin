/**
 * User-created graphs. Stored in localStorage (no DB yet) so they survive
 * reloads, and surfaced to the AI agents as chat context so they can turn a
 * graph into something else (e.g. a schedule or report) on request.
 */
export type GraphType = "bar" | "line" | "donut";

export interface SavedGraph {
  id: string;
  title: string;
  type: GraphType;
  data: { label: string; value: number }[];
  createdAt: string;
}

const KEY = "workforce-os:graphs";

export const graphTypeLabel: Record<GraphType, string> = {
  bar: "Balken",
  line: "Linie",
  donut: "Donut",
};

export function loadGraphs(): SavedGraph[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedGraph[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGraphs(graphs: SavedGraph[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(graphs));
}

/** Compact, prompt-friendly representation the AI agents can read. */
export function graphsToContext(graphs: SavedGraph[]): string {
  if (!graphs.length) return "";
  return graphs
    .map(
      (g) =>
        `- "${g.title}" [${g.type}]: ${g.data.map((d) => `${d.label}=${d.value}`).join(", ")}`,
    )
    .join("\n");
}
