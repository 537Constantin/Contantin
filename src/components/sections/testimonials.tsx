import { Star } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const testimonials = [
  {
    quote:
      "Die Texturen wirken außergewöhnlich hochwertig. Meine Haut fühlt sich gepflegt, ruhig und sichtbar ebenmäßiger an.",
    name: "Sophie K.",
    role: "Verifizierte Kundin",
  },
  {
    quote:
      "Eine Beauty Brand, die Luxus und Wirksamkeit auf stille, elegante Weise verbindet. Besonders das Serum überzeugt mich täglich.",
    name: "Clara M.",
    role: "Verifizierte Kundin",
  },
  {
    quote:
      "Vom Packaging bis zur Anwendung ist alles durchdacht. Die Marke vermittelt Vertrauen, Qualität und Ruhe.",
    name: "Nina M.",
    role: "Verifizierte Kundin",
  },
];

export function Testimonials() {
  return (
    <Section id="journal" className="bg-surface-soft/40">
      <Container>
        <Reveal>
          <Eyebrow>Stimmen</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Vertrauen, das sich in jeder Anwendung zeigt.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem
              key={t.name}
              className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-surface p-7 shadow-[var(--shadow-soft)]"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-ink-soft">
                „{t.quote}“
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-5">
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="text-sm text-muted">{t.role}</div>
              </figcaption>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
