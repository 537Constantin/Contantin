import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, AlertTriangle } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/footer";

/** Public, readable layout for the legal pages (Impressum/Datenschutz/AGB). */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-cyan))]">
              <Sparkles className="h-4 w-4 text-canvas" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">
              Smart<span className="text-gradient-brand">Staff</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Startseite
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {updated && <p className="mt-2 text-sm text-muted">Stand: {updated}</p>}
        <div className="mt-8 space-y-7 text-sm leading-relaxed text-ink-soft">{children}</div>
      </main>

      <MarketingFooter />
    </div>
  );
}

/** Highlighted note that a page is a template and needs review. */
export function LegalNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
