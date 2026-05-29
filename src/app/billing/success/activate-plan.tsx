"use client";

import * as React from "react";
import type { PlanId } from "@/lib/billing";
import { saveCurrentPlanId } from "@/lib/billing";

/**
 * Persists the just-purchased plan into the client demo state so the settings
 * page reflects it immediately. In a live deployment this is handled by the
 * Stripe webhook + database instead; here it keeps the demo coherent.
 */
export function ActivatePlan({ planId }: { planId: PlanId }) {
  React.useEffect(() => {
    saveCurrentPlanId(planId);
  }, [planId]);
  return null;
}
