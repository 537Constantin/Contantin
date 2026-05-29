import Link from "next/link";
import {
  Sparkles, ArrowRight, Phone, Calendar, Mail, FileText, MessagesSquare,
  Workflow, BarChart3, Brain, ShieldCheck, Zap, Check,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { employees, roleMeta } from "@/lib/data/employees";
import { plans, isPurchasable } from "@/lib/billing";

const features = [
  { icon: Phone, title: "Telefon-Assistent", desc: "Menschlich klingende Voice-AI nimmt Anrufe an, transkribiert live und bucht Termine." },
  { icon: Calendar, title: "Termin- & Kalenderpflege", desc: "Automatische Planung, Erinnerungen und Konfliktauflösung über alle Kalender." },
  { icon: Mail, title: "E-Mail-Verarbeitung", desc: "Postfach-Triage, Entwürfe und automatische Antworten im richtigen Ton." },
  { icon: FileText, title: "Dokumenten-Intelligenz", desc: "Upload, OCR, Zusammenfassung, Kategorisierung und semantische Suche." },
  { icon: MessagesSquare, title: "Kundensupport", desc: "Tickets in Sekunden lösen, eskalieren mit vollständigem Kontext." },
  { icon: Workflow, title: "Workflow-Automation", desc: "Trigger, Bedingungen und KI-Schritte verketten – ganz ohne Code." },
  { icon: BarChart3, title: "KI-Unternehmensberatung", desc: "Engpässe erkennen, KPIs auswerten und Handlungsempfehlungen erhalten." },
  { icon: Brain, title: "Eigenes Gedächtnis", desc: "Jeder Agent merkt sich Kontext, Vorlieben und Unternehmenswissen." },
];

const steps = [
  { n: "01", title: "Agent erstellen", desc: "Rolle wählen, Persönlichkeit & Fähigkeiten festlegen – in unter einer Minute." },
  { n: "02", title: "Wissen verbinden", desc: "Tools, Postfach, Kalender und Dokumente sicher anbinden." },
  { n: "03", title: "Arbeiten lassen", desc: "Dein KI-Team übernimmt autonom und eskaliert nur, wenn nötig." },
];

const stats = [
  { value: "638 h", label: "gespart pro Monat" },
  { value: "81 %", label: "Automatisierungsrate" },
  { value: "38 Sek.", label: "Ø Antwortzeit" },
  { value: "24/7", label: "verfügbar" },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <MarketingNav />

      {/* ambient grid (subtle, works on white & dark) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-ink)_6%,transparent),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      {/* HERO */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-36 text-center sm:px-8 sm:pt-44">
        <Reveal>
          <Badge variant="accent" className="mx-auto">
            <Sparkles className="h-3.5 w-3.5" /> Das Betriebssystem für KI-Mitarbeiter
          </Badge>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance text-ink sm:text-6xl">
            Stelle eine komplette <span className="text-gradient-brand">KI-Belegschaft</span> ein – in Minuten.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft text-balance">
            AI Workforce OS gibt deinem Unternehmen autonome KI-Mitarbeiter, die Telefon, Termine,
            E-Mails, Support, Dokumente und Beratung übernehmen. Wie ein echtes Team – nur rund um die Uhr.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link href="/dashboard">Live-Demo öffnen <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/chat">Mit einem Agenten chatten</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted">Keine Kreditkarte nötig · DSGVO-konform · In der EU gehostet</p>
        </Reveal>

        {/* Dashboard preview */}
        <Reveal delay={0.2} y={40}>
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="rounded-[var(--radius-card)] border border-border glass p-2 shadow-[var(--shadow-float)]">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-danger/60" />
                  <span className="h-3 w-3 rounded-full bg-warning/60" />
                  <span className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-3 text-xs text-muted">workforce-os.app/dashboard</span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-3">
                  {employees.slice(0, 3).map((e) => (
                    <div key={e.id} className="rounded-xl border border-border bg-surface-soft/40 p-3 text-left">
                      <div className="flex items-center gap-2">
                        <Avatar name={e.name} color={e.avatarColor} size="sm" glow />
                        <div>
                          <p className="text-sm font-semibold text-ink">{e.name}</p>
                          <p className="text-[11px] text-muted">{e.roleLabel}</p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-cyan))]" style={{ width: `${e.performance}%` }} />
                      </div>
                      <p className="mt-2 text-[11px] text-muted">{e.tasksCompleted.toLocaleString("de-DE")} Aufgaben erledigt</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* STATS */}
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-[var(--radius-card)] border border-border bg-surface/50 p-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-gradient-brand">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="cyan" className="mx-auto"><Zap className="h-3.5 w-3.5" /> Ein OS, das wirklich arbeitet</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Alles, was ein echtes Team kann</h2>
          <p className="mt-3 text-ink-soft">Von der Telefonannahme bis zur strategischen Beratung – deine KI-Mitarbeiter decken den gesamten Arbeitsalltag ab.</p>
        </div>
        <Stagger className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group h-full rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-[transform,border-color,box-shadow] duration-300 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1 hover:border-accent/30 hover:shadow-[var(--shadow-glow)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-canvas">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* AGENTS */}
      <section id="agents" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="accent" className="mx-auto"><Brain className="h-3.5 w-3.5" /> Deine Belegschaft</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Sechs Rollen. Unendlich viele Agenten.</h2>
          <p className="mt-3 text-ink-soft">Wähle eine Rolle, gib ihr einen Namen und eine Persönlichkeit – fertig ist dein neuer Mitarbeiter.</p>
        </div>
        <Stagger className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(roleMeta).map(([key, r]) => (
            <StaggerItem key={key}>
              <div className="flex h-full items-start gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/30">
                <span className="mt-0.5 h-10 w-10 shrink-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${r.color}, color-mix(in srgb, ${r.color} 50%, #06070d))` }} />
                <div>
                  <h3 className="font-semibold text-ink">{r.label}</h3>
                  <p className="mt-1 text-sm text-muted">{r.blurb}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* HOW */}
      <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">In drei Schritten startklar</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Reveal key={s.n} delay={Number(s.n) * 0.05}>
              <div className="h-full rounded-[var(--radius-card)] border border-border bg-surface p-6">
                <span className="font-display text-4xl font-bold text-gradient-brand">{s.n}</span>
                <h3 className="mt-3 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="success" className="mx-auto"><ShieldCheck className="h-3.5 w-3.5" /> Transparent & fair</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Preise, die mitwachsen</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <Reveal key={p.name} y={20}>
              <div className={`relative flex h-full flex-col rounded-[var(--radius-card)] border p-6 ${p.highlight ? "border-accent/50 bg-surface ring-1 ring-accent/30 shadow-[var(--shadow-glow)]" : "border-border bg-surface"}`}>
                {p.highlight && (
                  <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">Beliebt</Badge>
                )}
                <h3 className="font-display text-xl font-semibold text-ink">{p.name}</h3>
                <p className="mt-1 text-sm text-muted">{p.description}</p>
                <p className="mt-4 font-display text-4xl font-bold text-ink">{p.priceLabel}<span className="text-base font-normal text-muted">{p.price != null && "/mo"}</span></p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-soft">
                      <Check className="h-4 w-4 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                {isPurchasable(p) ? (
                  <CheckoutButton planId={p.id} variant={p.highlight ? "accent" : "outline"} className="mt-6 w-full">
                    {p.cta}
                  </CheckoutButton>
                ) : (
                  <Button asChild variant={p.highlight ? "accent" : "outline"} className="mt-6 w-full">
                    <a href={p.contact}>{p.cta}</a>
                  </Button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_18%,var(--color-surface)),var(--color-surface))] px-6 py-16 text-center">
            <div aria-hidden className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
                Dein digitales Team wartet.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-soft">
                Erstelle in den nächsten 60 Sekunden deinen ersten KI-Mitarbeiter und erlebe, wie sich dein Tag anfühlt, wenn die Routine sich selbst erledigt.
              </p>
              <Button asChild variant="accent" size="lg" className="mt-8">
                <Link href="/dashboard">Jetzt loslegen <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <MarketingFooter />
    </div>
  );
}
