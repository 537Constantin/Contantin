"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

const stats = [
  { value: "+12.000", label: "Zufriedene Kundinnen" },
  { value: "4,9/5", label: "Durchschnittsbewertung" },
  { value: "48h", label: "Schneller Versand" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
  };

  return (
    <section id="home" className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-44">
      {/* ambient gradient + grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-gold/12 blur-[120px]" />
        <div className="absolute right-[-10%] top-[30%] h-80 w-80 rounded-full bg-gold-soft/20 blur-[100px]" />
        <div className="noise absolute inset-0 opacity-50" />
      </div>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            variants={reduce ? undefined : container}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-soft backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Premium Skincare · Vegan · Cruelty-free
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-balance font-serif text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Zeitlose Schönheit.{" "}
              <span className="text-gradient-gold">Natürlich definiert.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
            >
              Eine moderne, elegante und conversion-optimierte Beauty-Welt –
              minimalistisch inszeniert, luxuriös im Ausdruck und gestaltet für
              Vertrauen, Premium-Positionierung und eine exzellente Erfahrung auf
              allen Geräten.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#shop">
                  Jetzt entdecken
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#brand">Markenwelt ansehen</Link>
              </Button>
            </motion.div>

            <motion.dl
              variants={item}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-float)]">
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80"
                alt="MAISON ELORIA – luxuriöses Pflegeritual"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.7 }}
              className="glass absolute -bottom-6 -left-4 max-w-[15rem] rounded-2xl border border-border p-5 shadow-[var(--shadow-float)] sm:-left-8"
            >
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <h3 className="mt-2 font-serif text-lg font-semibold">Luxury Ritual</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Formulierungen mit klarer Philosophie und einem Gefühl stiller
                Exklusivität.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
