const items = [
  "Vegan formuliert",
  "Cruelty-free",
  "Dermatologisch getestet",
  "Made in Germany",
  "Ohne Mikroplastik",
  "Recycelbare Verpackung",
  "Premium Positionierung",
  "DSGVO-konform",
];

export function Marquee() {
  return (
    <section
      aria-label="Markenversprechen"
      className="border-y border-border bg-surface-soft/50 py-6"
    >
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex shrink-0 animate-[var(--animate-marquee)] items-center gap-12 pr-12">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-12 whitespace-nowrap font-serif text-lg tracking-tight text-ink-soft"
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-gold/60" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
