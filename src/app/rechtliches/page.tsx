import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { legalSections } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Rechtliches – Impressum, Datenschutz, AGB & Widerruf",
  description:
    "Impressum, Datenschutzerklärung, AGB und Widerrufsbelehrung von MAISON ELORIA.",
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  return (
    <Container className="pt-32 pb-24 sm:pt-40">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <div className="mt-8">
        <Eyebrow>Rechtliches</Eyebrow>
        <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Impressum, Datenschutz, AGB &amp; Widerruf
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          Die folgenden Inhalte sind klar gegliedert und für die direkte Umsetzung
          vorbereitet. Platzhalter sind eindeutig markiert und müssen vor
          Veröffentlichung individuell ergänzt und rechtlich geprüft werden.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[200px_1fr]">
        <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="Rechtliche Abschnitte">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {legalSections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm text-ink-soft transition-colors hover:border-gold/50 hover:text-gold lg:border-0 lg:px-0 lg:py-1 lg:hover:border-0"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          {legalSections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                {s.title}
              </h2>
              <div className="mt-5 whitespace-pre-line rounded-[var(--radius-card)] border border-border bg-surface p-6 text-sm leading-relaxed text-ink-soft sm:p-8">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
