import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/section";
import { navLinks, siteConfig } from "@/lib/site";

const trust = [
  "Sichere Zahlung",
  "Schneller Versand",
  "Premium Support",
  "DSGVO-orientiert",
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-soft/40">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-serif text-2xl font-semibold tracking-tight">
              {siteConfig.name}
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Hochwertige, vegane Beauty-Produkte mit luxuriöser Markenästhetik –
              gestaltet für ein ruhiges, vertrauensvolles Einkaufserlebnis.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href={siteConfig.social.instagram}
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-surface"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href={siteConfig.social.linkedin}
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-surface"
              >
                <Linkedin className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>

          <nav aria-label="Footer Navigation">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="#home" className="text-ink-soft transition-colors hover:text-gold">
                  Start
                </Link>
              </li>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-soft transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/rechtliches" className="text-ink-soft transition-colors hover:text-gold">
                  Rechtliches
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Trust &amp; Service
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {trust.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/rechtliches#impressum" className="transition-colors hover:text-gold">
              Impressum
            </Link>
            <Link href="/rechtliches#datenschutz" className="transition-colors hover:text-gold">
              Datenschutz
            </Link>
            <Link href="/rechtliches#agb" className="transition-colors hover:text-gold">
              AGB
            </Link>
            <Link href="/rechtliches#widerruf" className="transition-colors hover:text-gold">
              Widerruf
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
