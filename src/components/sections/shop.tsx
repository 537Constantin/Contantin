"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Search, Star, X } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categories, products, type Product } from "@/lib/products";
import { cn, formatPrice } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Shop() {
  const [active, setActive] = React.useState<(typeof categories)[number]>("Alle");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Product | null>(null);
  const reduce = useReducedMotion();

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = active === "Alle" || p.category === active;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.promise.toLowerCase().includes(q) ||
        p.ingredients.some((i) => i.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [active, query]);

  return (
    <Section id="shop">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Kollektion</Eyebrow>
            <h2 className="mt-5 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Bestseller &amp; Pflegerituale
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Eine kuratierte Auswahl hochwertiger Beauty-Produkte mit luxuriösen
              Texturen, ausgewählten Inhaltsstoffen und klarer, moderner Ästhetik.
            </p>
          </div>

          <label className="relative block w-full max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produkte durchsuchen"
              aria-label="Produkte durchsuchen"
              className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-gold"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Kategorien">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={active === cat}
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-all duration-300 [transition-timing-function:var(--ease-lux)]",
                active === cat
                  ? "border-ink bg-ink text-canvas"
                  : "border-border bg-surface text-ink-soft hover:border-gold/50 hover:text-ink",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.li
                key={product.id}
                layout
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease }}
              >
                <ProductCard product={product} onOpen={() => setSelected(product)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted">
            Keine Produkte gefunden. Bitte passen Sie Ihre Suche an.
          </p>
        )}
      </Container>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}

function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-float)]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${product.name} ansehen`}
        className="relative aspect-[4/3] w-full overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.bestseller && <Badge variant="gold">Bestseller</Badge>}
          <Badge>{product.skinType}</Badge>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-semibold tracking-tight">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-muted">{product.promise}</p>
          </div>
          <span className="shrink-0 font-serif text-lg font-semibold">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {product.description}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-6">
          <Button variant="gold" size="sm" className="flex-1">
            In den Warenkorb
          </Button>
          <Button variant="outline" size="sm" onClick={onOpen}>
            Details
          </Button>
        </div>
      </div>
    </article>
  );
}

function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (product) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease }}
            className="relative grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-3xl border border-border bg-surface shadow-[var(--shadow-float)] sm:rounded-3xl md:grid-cols-2"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-ink backdrop-blur transition-colors hover:bg-surface-soft"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative hidden aspect-square md:block">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="40vw"
                className="object-cover"
              />
            </div>

            <div className="overflow-y-auto p-7">
              <div className="flex items-center gap-2">
                {product.bestseller && <Badge variant="gold">Bestseller</Badge>}
                <span className="inline-flex items-center gap-1 text-sm text-gold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {product.rating.toFixed(1).replace(".", ",")}
                </span>
              </div>

              <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                {product.name}
              </h3>
              <p className="mt-2 text-ink-soft">{product.description}</p>
              <p className="mt-4 font-serif text-2xl font-semibold">
                {formatPrice(product.price)}
              </p>

              <dl className="mt-6 space-y-4 border-t border-border pt-6 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Inhaltsstoffe
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {product.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs text-ink-soft"
                      >
                        <Check className="h-3 w-3 text-gold" />
                        {ing}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Anwendung
                  </dt>
                  <dd className="mt-1.5 leading-relaxed text-ink-soft">{product.usage}</dd>
                </div>
              </dl>

              <Button variant="gold" size="lg" className="mt-7 w-full">
                In den Warenkorb · {formatPrice(product.price)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
