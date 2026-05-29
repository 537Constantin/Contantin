"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, FileSpreadsheet, FileImage, FileAudio, File as FileIcon,
  Search, Sparkles, Trash2, Eye, EyeOff,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { documents as exampleDocs } from "@/lib/data/documents";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { DocumentItem } from "@/lib/types";
import {
  loadUserDocuments, saveUserDocuments, fileToDocument, formatBytes,
  type UserDocument, type DocKind,
} from "@/lib/files";

const kindIcon: Record<DocKind, typeof FileText> = {
  text: FileText, pdf: FileText, docx: FileIcon, xlsx: FileSpreadsheet,
  image: FileImage, audio: FileAudio, other: FileIcon,
};
const kindLabel: Record<DocKind, string> = {
  text: "Text", pdf: "PDF", docx: "Word", xlsx: "Tabelle",
  image: "Bild", audio: "Audio", other: "Datei",
};

const exampleTypeIcon = {
  pdf: FileText, docx: FileIcon, xlsx: FileSpreadsheet, image: FileImage, audio: FileAudio,
} as const;

export default function DocumentsPage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [docs, setDocs] = React.useState<UserDocument[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDocs(loadUserDocuments());
    setLoaded(true);
  }, []);
  React.useEffect(() => {
    if (loaded) saveUserDocuments(docs);
  }, [docs, loaded]);

  async function onFiles(list: FileList | File[] | null) {
    const files = list ? Array.from(list) : [];
    if (!files.length) return;
    setBusy(true);
    try {
      const added = await Promise.all(files.map(fileToDocument));
      setDocs((prev) => [...added, ...prev]);
    } finally {
      setBusy(false);
    }
  }

  const remove = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (openId === id) setOpenId(null);
  };

  function summarize(doc: UserDocument) {
    const prompt = doc.text
      ? "Fasse die angehängte Datei zusammen und nenne die wichtigsten Punkte."
      : `Ich habe die Datei „${doc.name}" hochgeladen. Sag mir, was du damit tun kannst.`;
    router.push(`/chat?agent=emp-marcus&doc=${encodeURIComponent(doc.id)}&prompt=${encodeURIComponent(prompt)}`);
  }

  const q = query.trim().toLowerCase();
  const filtered = q ? docs.filter((d) => d.name.toLowerCase().includes(q)) : docs;

  return (
    <PageShell>
      <PageHeader
        title="Dokumente"
        description="Lade Dateien hoch – Textdateien (.txt, .md, .csv, Code …) liest deine KI direkt und fasst sie zusammen."
      >
        <Button variant="accent" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Hochladen
        </Button>
      </PageHeader>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }}
      />

      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void onFiles(e.dataTransfer.files); }}
        className={cn(
          "mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-accent bg-accent/8" : "border-border bg-surface-soft/30 hover:border-accent/40",
        )}
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-canvas">
          <Upload className="h-6 w-6" />
        </span>
        <p className="mt-1 text-sm font-medium text-ink">
          {busy ? "Wird eingelesen…" : "Dateien hierher ziehen oder klicken"}
        </p>
        <p className="text-xs text-muted">
          Alle Dateitypen · Textdateien werden direkt gelesen · PDF/Word/Bild folgen als Referenz
        </p>
      </div>

      {/* My documents */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Meine Dokumente</h2>
          <Badge variant="default">{docs.length}</Badge>
        </div>
        {docs.length > 0 && (
          <label className="relative flex items-center sm:w-64">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dokumente durchsuchen…"
              className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
            />
          </label>
        )}
      </div>

      {docs.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-12 text-center text-sm text-muted">
            Noch keine Dokumente. Lade oben deine erste Datei hoch.
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-10 text-center text-sm text-muted">
            Keine Treffer für „{query}“.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((doc) => {
            const Icon = kindIcon[doc.kind];
            const open = openId === doc.id;
            return (
              <Card key={doc.id} hover>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-soft text-ink-soft">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium text-ink">{doc.name}</p>
                        <Badge variant={doc.text ? "success" : "outline"}>
                          {doc.text ? "Lesbar" : "Referenz"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">
                        {kindLabel[doc.kind]} · {formatBytes(doc.sizeKb * 1024)} · {formatRelativeTime(doc.createdAt)}
                      </p>

                      {doc.text ? (
                        <p className="mt-2.5 line-clamp-2 rounded-xl bg-surface-soft/50 p-2.5 text-[13px] leading-relaxed text-ink-soft">
                          {doc.text.slice(0, 180) || "(leer)"}
                        </p>
                      ) : (
                        <p className="mt-2.5 rounded-xl bg-surface-soft/50 p-2.5 text-[13px] leading-relaxed text-muted">
                          Binärdatei – als Referenz gespeichert. Automatisches Lesen von {kindLabel[doc.kind]}-Dateien folgt.
                        </p>
                      )}

                      {open && doc.text && (
                        <pre className="mt-2 max-h-64 overflow-auto rounded-xl border border-border bg-surface p-3 text-[12px] leading-relaxed text-ink-soft whitespace-pre-wrap break-words">
                          {doc.text}
                        </pre>
                      )}

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <Button variant="accent" size="sm" onClick={() => summarize(doc)}>
                          <Sparkles className="h-3.5 w-3.5" /> Mit KI zusammenfassen
                        </Button>
                        {doc.text && (
                          <Button variant="outline" size="sm" onClick={() => setOpenId(open ? null : doc.id)}>
                            {open ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {open ? "Verbergen" : "Ansehen"}
                          </Button>
                        )}
                        <button
                          onClick={() => remove(doc.id)}
                          className="ml-auto grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-danger"
                          aria-label="Dokument löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Examples */}
      <div className="mt-8 flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Beispiele</h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        So sieht die KI-Analyse aus, sobald deine Dokumente verarbeitet sind.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {exampleDocs.map((doc) => (
          <ExampleCard key={doc.id} doc={doc} />
        ))}
      </div>
    </PageShell>
  );
}

function ExampleCard({ doc }: { doc: DocumentItem }) {
  const Icon = exampleTypeIcon[doc.type];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-soft text-ink-soft">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{doc.name}</p>
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
