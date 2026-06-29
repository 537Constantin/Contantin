"use client";

/**
 * Premium motion toolkit — small, cohesive building blocks reused across the
 * whole app. Everything degrades gracefully with prefers-reduced-motion.
 */
import * as React from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  useMotionValue,
  useSpring,
  useScroll,
  useMotionTemplate,
  animate,
} from "motion/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Page transition ──────────────────────────────────────────────────────
 * Re-mounts on every route change (keyed on pathname) so the new page fades +
 * rises + sharpens into view. Clean, fast, and works with the App Router. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Spotlight card ───────────────────────────────────────────────────────
 * A surface whose subtle radial glow follows the cursor. `ring` adds an
 * animated conic gradient border on hover; `tilt` makes it lean in 3D toward
 * the cursor with a moving light glare. */
export function SpotlightCard({
  children,
  className,
  ring = false,
  tilt = false,
}: {
  children: React.ReactNode;
  className?: string;
  ring?: boolean;
  tilt?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const rxv = useMotionValue(0);
  const ryv = useMotionValue(0);
  const rx = useSpring(rxv, { stiffness: 180, damping: 16, mass: 0.4 });
  const ry = useSpring(ryv, { stiffness: 180, damping: 16, mass: 0.4 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22), transparent 45%)`;

  const active = tilt && !reduce;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    if (active) {
      ryv.set((px - 0.5) * 9);
      rxv.set(-(py - 0.5) * 9);
      gx.set(px * 100);
      gy.set(py * 100);
    }
  }
  function onLeave() {
    rxv.set(0);
    ryv.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={active ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined}
      className={cn("group spotlight", ring && "gradient-ring", active && "transform-gpu", className)}
    >
      {active && (
        <motion.div
          aria-hidden
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <div className="relative z-[1] h-full">{children}</div>
    </motion.div>
  );
}

/* ── Cursor glow ──────────────────────────────────────────────────────────
 * A soft light that trails the pointer across the whole app (desktop only).
 * Auto-themes via --color-ink so it reads as a dark glow on light and a light
 * glow on dark. */
export function CursorGlow() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.5 });

  React.useEffect(() => {
    if (reduce) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [reduce, x, y]);

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        left: sx,
        top: sy,
        background:
          "radial-gradient(circle, color-mix(in srgb, var(--color-ink) 7%, transparent), transparent 60%)",
      }}
      className="pointer-events-none fixed z-[15] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
    />
  );
}

/* ── Scroll progress ──────────────────────────────────────────────────────
 * A slim gradient bar pinned to the very top, filling as the page scrolls. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[linear-gradient(90deg,var(--color-accent),var(--color-cyan))]"
    />
  );
}

/* ── Animated counter ─────────────────────────────────────────────────────
 * Counts up from 0 to `value` when scrolled into view. */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className,
  format,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  /** Custom formatter for the raw number (overrides decimals). */
  format?: (n: number) => string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  const text = format
    ? format(display)
    : display.toLocaleString("de-DE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

/* ── Magnetic ─────────────────────────────────────────────────────────────
 * Gently pulls its child toward the cursor — great for primary CTAs. */
export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={reduce ? undefined : { x: sx, y: sy }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}
