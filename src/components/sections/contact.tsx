"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-gold";

export function Contact() {
  return (
    <Section id="contact" className="bg-surface-soft/40">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-between gap-10 rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
            <div>
              <Eyebrow>Kontakt</Eyebrow>
              <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Wir freuen uns auf Ihre Nachricht.
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Fragen zu Produkten, Bestellungen oder Kooperationen? Unser Team
                antwortet ruhig, kompetent und persönlich.
              </p>
            </div>

            <NewsletterForm />

            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-gold"
            >
              <Mail className="h-4 w-4" />
              {siteConfig.email}
            </a>
          </div>

          <ContactForm />
        </div>
      </Container>
    </Section>
  );
}

function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  return (
    <div className="rounded-2xl bg-surface-soft p-5">
      <h3 className="font-serif text-lg font-semibold">Exklusive Rituale &amp; Neuheiten</h3>
      <p className="mt-1 text-sm text-muted">
        Ausgewählte Launches, stilvoll und reduziert.
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.includes("@")) setDone(true);
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ihre E-Mail-Adresse"
          aria-label="E-Mail-Adresse für Newsletter"
          className={inputClass}
        />
        <Button type="submit" aria-label="Newsletter abonnieren">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <AnimatePresence>
        {done && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Bitte bestätigen Sie die E-Mail in Ihrem Postfach (Double-Opt-in).
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactForm() {
  const [sent, setSent] = React.useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-soft)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input required placeholder="Vorname" aria-label="Vorname" className={inputClass} />
        <input required placeholder="Nachname" aria-label="Nachname" className={inputClass} />
        <input
          required
          type="email"
          placeholder="E-Mail-Adresse"
          aria-label="E-Mail-Adresse"
          className={inputClass}
        />
        <input placeholder="Telefon (optional)" aria-label="Telefon" className={inputClass} />
      </div>
      <input
        required
        placeholder="Betreff"
        aria-label="Betreff"
        className={`${inputClass} mt-4`}
      />
      <textarea
        required
        rows={5}
        placeholder="Ihre Nachricht"
        aria-label="Ihre Nachricht"
        className="mt-4 w-full rounded-xl border border-border bg-surface p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-gold"
      />
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Mit dem Absenden willigen Sie in die Verarbeitung Ihrer Daten zur
        Bearbeitung Ihrer Anfrage ein. Weitere Informationen in der
        Datenschutzerklärung.
      </p>

      <div className="mt-5 flex items-center gap-4">
        <Button type="submit" size="lg" disabled={sent}>
          {sent ? "Nachricht gesendet" : "Nachricht senden"}
        </Button>
        <AnimatePresence>
          {sent && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1.5 text-sm text-gold"
            >
              <CheckCircle2 className="h-4 w-4" />
              Vielen Dank!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
