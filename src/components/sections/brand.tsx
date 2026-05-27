import { Leaf, Recycle, ShieldCheck, Sparkles } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const pillars = [
  {
    icon: Leaf,
    title: "Vegan formuliert",
    body: "Ausgewählte Rezepturen ohne tierische Inhaltsstoffe für ein zeitgemäßes Premiumverständnis.",
  },
  {
    icon: ShieldCheck,
    title: "Dermatologisch getestet",
    body: "Sanfte Pflege mit Fokus auf Hautverträglichkeit, Vertrauen und hochwertige Formulierung.",
  },
  {
    icon: Sparkles,
    title: "Cruelty-free",
    body: "Verantwortungsvoll entwickelte Produkte mit glaubwürdiger, ruhiger Markenhaltung.",
  },
  {
    icon: Recycle,
    title: "Nachhaltig gedacht",
    body: "Bewusste Entscheidungen bei Materialien, Verpackung und langfristiger Markenführung.",
  },
];

export function Brand() {
  return (
    <Section id="brand">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <Eyebrow>Marke</Eyebrow>
            <h2 className="mt-5 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              High-End-Pflege, die Ritual und Wirkung in Einklang bringt.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              MAISON ELORIA verbindet anspruchsvolles Design, ausgewählte
              Inhaltsstoffe und ein reduziertes Erscheinungsbild zu einer souveränen,
              vertrauensvollen und hochwertigen Markenidentität.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {["Ruhige Premium-Ästhetik", "SEO-orientiert", "Mobil optimiert"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink-soft"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </Reveal>

          <Stagger className="grid gap-4 sm:grid-cols-2">
            {pillars.map((p) => (
              <StaggerItem
                key={p.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-soft)] transition-transform duration-500 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/12 text-gold">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}
