import Image from "next/image";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const values = [
  {
    title: "Qualität",
    body: "Sorgfältig kuratierte Rezepturen, klare Produktarchitektur und hochwertiger Markenauftritt.",
  },
  {
    title: "Nachhaltigkeit",
    body: "Bewusste Entscheidungen bei Materialien, Verpackung und langfristiger Markenführung.",
  },
  {
    title: "Vertrauen",
    body: "Transparente Kommunikation, ruhiger Ton und ein kundenorientiertes, glaubwürdiges Erlebnis.",
  },
];

export function About() {
  return (
    <Section id="about">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-float)]">
              <Image
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80"
                alt="MAISON ELORIA – Markenwelt"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <Eyebrow>Über uns</Eyebrow>
              <h2 className="mt-5 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                Eine Markenstory mit Ruhe, Wirkung und Haltung.
              </h2>
              <p className="mt-6 leading-relaxed text-ink-soft">
                MAISON ELORIA entstand aus dem Wunsch, Beauty neu zu
                interpretieren: weniger Lautstärke, mehr Substanz. Im Mittelpunkt
                stehen klar konzipierte Pflegerituale, zurückhaltender Luxus und
                eine Haltung, die Qualität, Nachhaltigkeit und Sinnlichkeit
                verbindet.
              </p>
            </Reveal>

            <Stagger className="mt-8 space-y-4">
              {values.map((v) => (
                <StaggerItem
                  key={v.title}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <h3 className="font-serif text-lg font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Container>
    </Section>
  );
}
