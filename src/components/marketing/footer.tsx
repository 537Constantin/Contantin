import Link from "next/link";
import { Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/site";

const columns = [
  { title: "Produkt", links: ["Funktionen", "KI-Mitarbeiter", "Workflows", "Preise"] },
  { title: "Unternehmen", links: ["Über uns", "Karriere", "Blog", "Kontakt"] },
  { title: "Rechtliches", links: ["Datenschutz", "AGB", "Impressum", "DSGVO"] },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-cyan))]">
              <Sparkles className="h-4 w-4 text-canvas" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">Workforce<span className="text-gradient-brand"> OS</span></span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">{siteConfig.tagline}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-ink">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <span className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-muted sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.</p>
          <p>Made in EU · DSGVO-konform · SOC 2</p>
        </div>
      </div>
    </footer>
  );
}
