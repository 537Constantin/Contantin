"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart,
  Plus,
  Trash2,
  Save,
  Sparkles,
  CalendarRange,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleBarChart, AreaChart, Donut } from "@/components/app/charts";
import {
  loadGraphs,
  saveGraphs,
  graphTypeLabel,
  type SavedGraph,
  type GraphType,
} from "@/lib/graphs";
import { cn } from "@/lib/utils";

const donutPalette = [
  "var(--color-ink)",
  "var(--color-muted)",
  "var(--color-cyan)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-violet)",
];

const types: { key: GraphType; label: string; icon: typeof BarChart3 }[] = [
  { key: "bar", label: "Balken", icon: BarChart3 },
  { key: "line", label: "Linie", icon: LineIcon },
  { key: "donut", label: "Donut", icon: PieChart },
];

interface Row {
  id: string;
  label: string;
  value: string;
}

const rid = () => Math.random().toString(36).slice(2, 9);

const sampleRows = (): Row[] => [
  { id: rid(), label: "Mo", value: "8" },
  { id: rid(), label: "Di", value: "6" },
  { id: rid(), label: "Mi", value: "9" },
  { id: rid(), label: "Do", value: "5" },
  { id: rid(), label: "Fr", value: "7" },
];

export default function ChartsPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<GraphType>("bar");
  const [rows, setRows] = React.useState<Row[]>(sampleRows);
  const [saved, setSaved] = React.useState<SavedGraph[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setSaved(loadGraphs());
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (loaded) saveGraphs(saved);
  }, [saved, loaded]);

  const validData = rows
    .map((r) => ({ label: r.label.trim(), value: Number(r.value.replace(",", ".")) }))
    .filter((r) => r.label && Number.isFinite(r.value));

  const canSave = title.trim().length > 0 && validData.length >= 1;

  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { id: rid(), label: "", value: "" }]);
  const removeRow = (id: string) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  function save() {
    if (!canSave) return;
    const graph: SavedGraph = {
      id: rid(),
      title: title.trim(),
      type,
      data: validData,
      createdAt: new Date().toISOString(),
    };
    setSaved((s) => [graph, ...s]);
    setTitle("");
    setRows(sampleRows());
  }

  const remove = (id: string) => setSaved((s) => s.filter((g) => g.id !== id));

  const openInChat = (prompt: string) =>
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);

  return (
    <PageShell>
      <PageHeader
        title="Diagramme"
        description="Erstelle eigene Graphen aus deinen Daten – und lass deine KI-Mitarbeiter daraus z. B. Terminpläne oder Reports erstellen."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Neuer Graph</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Titel</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. Arbeitsstunden pro Tag"
                className="h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Typ</label>
              <div className="grid grid-cols-3 gap-2">
                {types.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all",
                      type === t.key
                        ? "border-accent/60 bg-accent/8 text-ink"
                        : "border-border text-ink-soft hover:border-accent/30",
                    )}
                  >
                    <t.icon className="h-4 w-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Daten</label>
              <div className="space-y-2">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <input
                      value={r.label}
                      onChange={(e) => updateRow(r.id, { label: e.target.value })}
                      placeholder="Bezeichnung"
                      className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface-soft/50 px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
                    />
                    <input
                      value={r.value}
                      onChange={(e) =>
                        updateRow(r.id, { value: e.target.value.replace(/[^0-9.,-]/g, "") })
                      }
                      inputMode="decimal"
                      placeholder="Wert"
                      className="h-10 w-24 rounded-lg border border-border bg-surface-soft/50 px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
                    />
                    <button
                      onClick={() => removeRow(r.id)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-soft hover:text-danger"
                      aria-label="Zeile entfernen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addRow}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
              >
                <Plus className="h-4 w-4" /> Zeile hinzufügen
              </button>
            </div>

            <div className="flex justify-end">
              <Button variant="accent" size="sm" onClick={save} disabled={!canSave}>
                <Save className="h-4 w-4" /> Speichern
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Vorschau</CardTitle>
            {validData.length > 0 && <Badge variant="outline">{graphTypeLabel[type]}</Badge>}
          </CardHeader>
          <CardContent>
            {validData.length > 0 ? (
              <>
                {title.trim() && (
                  <p className="mb-4 font-display text-lg font-semibold text-ink">{title}</p>
                )}
                <GraphView type={type} data={validData} />
              </>
            ) : (
              <p className="py-16 text-center text-sm text-muted">
                Gib mindestens eine Zeile mit Bezeichnung und Wert ein, um die Vorschau zu sehen.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved gallery */}
      <div className="mt-8 flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Meine Diagramme</h2>
        <Badge variant="default">{saved.length}</Badge>
      </div>

      {saved.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-12 text-center text-sm text-muted">
            Noch keine gespeicherten Diagramme. Erstelle oben deinen ersten Graphen.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {saved.map((g) => (
            <Card key={g.id} hover>
              <CardHeader>
                <div>
                  <CardTitle>{g.title}</CardTitle>
                  <p className="mt-1 text-xs text-muted">
                    {graphTypeLabel[g.type]} · {g.data.length} Werte
                  </p>
                </div>
                <button
                  onClick={() => remove(g.id)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-danger"
                  aria-label="Diagramm löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <GraphView type={g.type} data={g.data} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() =>
                      openInChat(`Analysiere das Diagramm "${g.title}" und nenne die wichtigsten Erkenntnisse.`)
                    }
                  >
                    <Sparkles className="h-4 w-4" /> KI-Analyse
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInChat(`Erstelle aus dem Diagramm "${g.title}" einen Terminplan.`)}
                  >
                    <CalendarRange className="h-4 w-4" /> Terminplan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function GraphView({
  type,
  data,
}: {
  type: GraphType;
  data: { label: string; value: number }[];
}) {
  if (type === "line") return <AreaChart data={data} tone="accent" />;
  if (type === "donut")
    return (
      <Donut
        unit=""
        data={data.map((d, i) => ({ ...d, color: donutPalette[i % donutPalette.length] }))}
      />
    );
  return <SimpleBarChart data={data} />;
}
