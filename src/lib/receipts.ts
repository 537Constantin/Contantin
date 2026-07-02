/**
 * Receipt / invoice scanner model + helpers.
 *
 * A receipt is created by photographing an invoice; OpenAI Vision extracts the
 * fields. Stored per user under the "receipt" store kind (localStorage + DB).
 */

export const RECEIPT_CATEGORIES = [
  "Büro",
  "Reise",
  "Bewirtung",
  "Software",
  "Wareneinkauf",
  "Marketing",
  "Sonstiges",
] as const;

export interface Receipt {
  id: string;
  vendor: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** Gross total. */
  total: number | null;
  net: number | null;
  vatAmount: number | null;
  /** VAT percent, e.g. 19. */
  vatRate: number | null;
  currency: string;
  category: string;
  invoiceNumber: string | null;
  createdAt: string;
}

/** What the extraction API returns (before it gets an id). */
export type ReceiptDraft = Omit<Receipt, "id" | "createdAt">;

export function emptyDraft(): ReceiptDraft {
  return {
    vendor: "",
    date: "",
    total: null,
    net: null,
    vatAmount: null,
    vatRate: null,
    currency: "EUR",
    category: "Sonstiges",
    invoiceNumber: null,
  };
}

export function fmtMoney(n: number | null, currency = "EUR"): string {
  if (n === null || Number.isNaN(n)) return "—";
  return n.toLocaleString("de-DE", { style: "currency", currency: currency || "EUR" });
}

/**
 * Read an image File, downscale it (max edge `maxDim`) and return a JPEG data
 * URL. Keeps the upload well under the platform body limit and speeds up the
 * vision call. Browser-only.
 */
export function fileToImageDataUrl(file: File, maxDim = 1600, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no-canvas"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-load-failed"));
    };
    img.src = url;
  });
}

/** Export receipts to a semicolon-separated CSV (German-Excel friendly). */
export function receiptsToCSV(list: Receipt[]): string {
  const head = ["Datum", "Lieferant", "Betrag", "Netto", "MwSt", "MwSt-Satz", "Währung", "Kategorie", "Rechnungsnr."];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const num = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));
  const rows = list.map((r) =>
    [
      r.date,
      r.vendor,
      num(r.total),
      num(r.net),
      num(r.vatAmount),
      r.vatRate === null ? "" : `${r.vatRate}%`,
      r.currency,
      r.category,
      r.invoiceNumber ?? "",
    ]
      .map((c) => esc(String(c)))
      .join(";"),
  );
  return [head.map(esc).join(";"), ...rows].join("\r\n");
}
