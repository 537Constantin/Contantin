import type { Metadata } from "next";
import { Upload, FileText, FileSpreadsheet, FileImage, FileAudio, File, Search, Sparkles } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { documents } from "@/lib/data/documents";
import { formatRelativeTime } from "@/lib/utils";
import type { DocumentItem } from "@/lib/types";

export const metadata: Metadata = { title: "Dokumente" };

const typeIcon = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
  image: FileImage,
  audio: FileAudio,
} as const;

const statusMeta = {
  processed: { label: "Verarbeitet", variant: "success" as const },
  processing: { label: "Wird analysiert", variant: "cyan" as const },
  needs_review: { label: "Prüfung nötig", variant: "warning" as const },
};

export default function DocumentsPage() {
  const categories = [...new Set(documents.map((d) => d.category))];

  return (
    <PageShell>
      <PageHeader
        title="Dokumente"
        description="Lade Dateien hoch – deine KI extrahiert Inhalte, fasst zusammen, kategorisiert und macht alles durchsuchbar."
      >
        <Button variant="accent" size="sm">
          <Upload className="h-4 w-4" /> Hochladen
        </Button>
      </PageHeader>

      {/* Dropzone */}
      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border bg-surface-soft/30 px-6 py-10 text-center transition-colors hover:border-accent/40">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-canvas">
          <Upload className="h-6 w-6" />
        </span>
        <p className="mt-1 text-sm font-medium text-ink">Dateien hierher ziehen oder klicken</p>
        <p className="text-xs text-muted">PDF, DOCX, XLSX, Bilder & Audio · bis 50 MB · KI-Analyse inklusive</p>
        <input type="file" multiple className="sr-only" />
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="accent">Alle</Badge>
          {categories.map((c) => (
            <Badge key={c} variant="outline">{c}</Badge>
          ))}
        </div>
        <label className="relative flex items-center sm:w-64">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
          <input
            placeholder="Semantische Suche…"
            className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {documents.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>
    </PageShell>
  );
}

function DocCard({ doc }: { doc: DocumentItem }) {
  const Icon = typeIcon[doc.type];
  const sm = statusMeta[doc.status];
  return (
    <Card hover>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-soft text-ink-soft">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-medium text-ink">{doc.name}</p>
              <Badge variant={sm.variant}>{sm.label}</Badge>
            </div>
            <p className="text-xs text-muted">
              {doc.category} · {(doc.sizeKb / 1024).toFixed(1)} MB · {formatRelativeTime(doc.uploadedAt)}
            </p>
            <div className="mt-2.5 flex gap-2 rounded-xl bg-surface-soft/50 p-2.5">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <p className="text-[13px] leading-relaxed text-ink-soft">{doc.summary}</p>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {doc.tags.map((t) => (
                <span key={t} className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-muted">#{t}</span>
              ))}
              <span className="ml-auto text-[11px] text-muted">von {doc.owner}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
