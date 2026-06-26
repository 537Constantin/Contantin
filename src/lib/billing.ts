/**
 * Billing is optional, just like the chat key and Clerk auth. When
 * `STRIPE_SECRET_KEY` is present the checkout routes talk to the real Stripe
 * API; without it everything falls back to a fully interactive demo so the app
 * keeps running with zero configuration.
 *
 * This module is the single source of truth for the pricing plans — the
 * landing page, the settings billing tab and the checkout API all import from
 * here, so the numbers can never drift apart.
 *
 * Enable live payments (free Stripe test mode at https://stripe.com):
 *   STRIPE_SECRET_KEY=sk_test_...
 *   STRIPE_PRICE_STARTER=price_...   (a recurring monthly price)
 *   STRIPE_PRICE_GROWTH=price_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...  (optional, verifies webhooks)
 */

export type PlanId = "starter" | "growth" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  /** Monthly price in EUR, or null for the contact-sales plan. */
  price: number | null;
  /** Pre-formatted price label, e.g. "49 €" or "Individuell". */
  priceLabel: string;
  agents: string;
  actions: string;
  features: string[];
  cta: string;
  highlight: boolean;
  /**
   * Name of the env var holding this plan's Stripe Price ID. Resolved at
   * request time on the server so the bundle never needs the value.
   */
  priceEnv?: string;
  /** Where a sales-led plan should send the user (e.g. a mailto link). */
  contact?: string;
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Für Einzelunternehmer & kleine Teams",
    price: 49,
    priceLabel: "49 €",
    agents: "3 KI-Mitarbeiter",
    actions: "1.000 Aktionen / Monat",
    features: ["3 KI-Mitarbeiter", "1.000 Aktionen / Monat", "E-Mail & Chat", "Basis-Analytics"],
    cta: "Starter wählen",
    highlight: false,
    priceEnv: "STRIPE_PRICE_STARTER",
  },
  {
    id: "growth",
    name: "Growth",
    description: "Für wachsende Unternehmen",
    price: 199,
    priceLabel: "199 €",
    agents: "10 KI-Mitarbeiter",
    actions: "10.000 Aktionen / Monat",
    features: [
      "10 KI-Mitarbeiter",
      "10.000 Aktionen / Monat",
      "Buchhaltungs-Mitarbeiter inkl.",
      "Workflows & Automation",
      "Erweiterte Analytics",
    ],
    cta: "Growth wählen",
    highlight: true,
    priceEnv: "STRIPE_PRICE_GROWTH",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Für große Organisationen",
    price: null,
    priceLabel: "Individuell",
    agents: "Unbegrenzte Agenten",
    actions: "Unbegrenzte Aktionen",
    features: [
      "Unbegrenzte Agenten",
      "Unbegrenzte Aktionen",
      "SSO & Audit-Logs",
      "SLA & dedizierter Support",
      "On-Premise möglich",
    ],
    cta: "Vertrieb kontaktieren",
    highlight: false,
    contact: "mailto:sales@workforce-os.app?subject=Enterprise-Anfrage%20AI%20Workforce%20OS",
  },
];

export function getPlan(id: string | null | undefined): Plan | undefined {
  return plans.find((p) => p.id === id);
}

/** True when this is a paid, self-serve plan that can be checked out. */
export function isPurchasable(plan: Plan): plan is Plan & { price: number; priceEnv: string } {
  return plan.price != null && Boolean(plan.priceEnv);
}

// ── Server-only helpers ──────────────────────────────────────────────────
// These read process.env and must only be called from server code (route
// handlers / server components). On the client they would always be falsy.

/** Live Stripe is configured when the secret key is present. */
export function isStripeLive(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Resolve the configured Stripe Price ID for a plan, if any. */
export function priceIdFor(plan: Plan): string | undefined {
  return plan.priceEnv ? process.env[plan.priceEnv] : undefined;
}

// ── Client demo state ────────────────────────────────────────────────────
// Without a database there is nowhere to persist a subscription, so in demo
// mode we remember the chosen plan in localStorage (same approach as saved
// graphs). A real deployment replaces this with the Stripe customer record.

const PLAN_KEY = "workforce-os:plan";

export function loadCurrentPlanId(): PlanId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAN_KEY);
    return raw && plans.some((p) => p.id === raw) ? (raw as PlanId) : null;
  } catch {
    return null;
  }
}

export function saveCurrentPlanId(id: PlanId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PLAN_KEY, id);
  } catch {
    /* storage unavailable — ignore */
  }
}
