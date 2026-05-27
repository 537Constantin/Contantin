"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig } from "@/lib/site";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));

  // Lock body scroll when the mobile menu is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 [transition-timing-function:var(--ease-lux)] sm:px-5",
            scrolled
              ? "glass border border-border shadow-[var(--shadow-soft)]"
              : "border border-transparent",
          )}
        >
          <Link
            href="#home"
            className="font-serif text-lg font-semibold tracking-tight"
            aria-label={`${siteConfig.name} – zur Startseite`}
          >
            {siteConfig.name}
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm text-ink-soft transition-colors duration-300 hover:bg-surface-soft hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="#shop">Jetzt entdecken</Link>
            </Button>
            <button
              type="button"
              aria-label="Menü öffnen"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/60 md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-canvas/80 backdrop-blur-xl"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-3 mt-24 space-y-1 rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-float)]"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-lg font-medium text-ink transition-colors hover:bg-surface-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link href="#shop">Jetzt entdecken</Link>
                </Button>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
