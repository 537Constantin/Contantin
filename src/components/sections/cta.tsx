import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CTA() {
  return (
    <Section>
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-ink px-8 py-16 text-center text-canvas sm:px-16 sm:py-24">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/30 blur-[100px]" />
              <div className="noise absolute inset-0 opacity-30" />
            </div>
            <h2 className="relative mx-auto max-w-2xl text-balance font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Beginnen Sie Ihr Ritual zeitloser Schönheit.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg text-canvas/70">
              Kostenfreier Versand ab 60 € · 30 Tage Rückgaberecht · Premium Support
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="#shop">
                  Kollektion entdecken
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border border-canvas/20 bg-transparent text-canvas hover:bg-canvas/10"
              >
                <Link href="#contact">Kontakt aufnehmen</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
