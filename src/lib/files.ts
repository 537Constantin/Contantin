/**
 * File handling for chat attachments and the documents library.
 *
 * Text-based files (.txt, .md, .csv, code, …) are read in the browser and their
 * content is handed to the AI as real context. Binary files (PDF, Word, images)
 * are accepted as references for now; automatic text extraction for those is a
 * follow-up (server-side parsing once the DB/storage layer lands).
 *
 * Uploaded documents are persisted in localStorage — same approach as the saved
 * graphs and workflows — so they survive reloads with no backend.
 */

export type DocKind = "text" | "pdf" | "docx" | "xlsx" | "image" | "audio" | "other";

/** Cap on how much text we keep / send to the model, to stay within context. */
export const MAX_TEXT_CHARS = 20000;

/** Files larger than this are not sent for server extraction (platform body
 * limit ~4.5 MB); they are attached as a reference instead. */
export const MAX_UPLOAD_FOR_EXTRACT = 4 * 1024 * 1024;

const TEXT_EXTENSIONS = [
  "txt", "md", "markdown", "csv", "tsv", "json", "yaml", "yml", "xml", "html",
  "htm", "css", "js", "mjs", "ts", "jsx", "tsx", "py", "java", "c", "h", "cpp",
  "cs", "go", "rb", "php", "rs", "kt", "swift", "sh", "bash", "sql", "log",
  "ini", "conf", "env", "toml",
];

const TEXT_MIME = [
  "application/json", "application/xml", "application/javascript",
  "application/x-ndjson", "application/csv", "application/x-sh",
  "application/x-yaml",
];

function extOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** True when we can read the file's content as plain text in the browser. */
export function isTextFile(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  if (TEXT_MIME.includes(file.type)) return true;
  return TEXT_EXTENSIONS.includes(extOf(file.name));
}

export function kindFromFile(file: File): DocKind {
  if (isTextFile(file)) return "text";
  const t = file.type;
  const ext = extOf(file.name);
  if (t === "application/pdf" || ext === "pdf") return "pdf";
  if (t.includes("word") || ext === "doc" || ext === "docx") return "docx";
  if (t.includes("sheet") || t.includes("excel") || ext === "xls" || ext === "xlsx") return "xlsx";
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("audio/")) return "audio";
  return "other";
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Datei konnte nicht gelesen werden."));
    reader.readAsText(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

// ---------------------------------------------------------------------------
// Documents library (localStorage)
// ---------------------------------------------------------------------------

export interface DocAnalysis {
  summary: string;
  keyFacts: string[];
  tags: string[];
  category: string;
  at: string;
}

export interface DocQA {
  q: string;
  a: string;
}

export interface UserDocument {
  id: string;
  name: string;
  kind: DocKind;
  mime: string;
  sizeKb: number;
  /** Extracted text for readable files (capped); null for binary files. */
  text: string | null;
  createdAt: string;
  /** Real AI analysis, produced on demand and persisted with the document. */
  analysis?: DocAnalysis;
  /** Questions the user asked about this document, with the AI's answers. */
  qa?: DocQA[];
}

const KEY = "workforce-os:documents";

export function loadUserDocuments(): UserDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as UserDocument[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserDocuments(list: UserDocument[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

/** Extract text from a PDF/Word file via the server route. Returns null if the
 * file is too large, unreadable (e.g. a scanned PDF) or the request fails. */
export async function extractTextFromFile(file: File): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (file.size > MAX_UPLOAD_FOR_EXTRACT) return null;
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/extract", { method: "POST", body: form });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as { text?: string } | null;
    const text = typeof json?.text === "string" ? json.text.trim() : "";
    return text || null;
  } catch {
    return null;
  }
}

/** Read a File into a UserDocument, extracting text when possible. */
export async function fileToDocument(file: File): Promise<UserDocument> {
  const kind = kindFromFile(file);
  let text: string | null = null;
  if (kind === "text") {
    try {
      text = (await readTextFile(file)).slice(0, MAX_TEXT_CHARS);
    } catch {
      text = null;
    }
  } else if (kind === "pdf" || kind === "docx") {
    text = await extractTextFromFile(file);
  }
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: file.name,
    kind,
    mime: file.type || "application/octet-stream",
    sizeKb: Math.max(1, Math.round(file.size / 1024)),
    text,
    createdAt: new Date().toISOString(),
  };
}
