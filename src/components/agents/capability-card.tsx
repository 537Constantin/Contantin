"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Zap, Hand, Webhook, Plug, Power, Cog, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Capability, IntegrationRequirement, TriggerKind } from "@/lib/types";
import { triggerLabel } from "@/lib/agents/capabilities";
import { getIntegration } from "@/lib/agents/integrations";
import { cn } from "@/lib/utils";

const triggerIcon: Record<TriggerKind, typeof Clock> = {
  manual: Hand,
  schedule: Clock,
  event: Zap,
  webhook: Webhook,
};

interface Props {
  capability: Capability;
  enabled: boolean;
  missingIntegrations: IntegrationRequirement[];
  /** IDs the user currently has connected — used to label alternatives. */
  connectedIntegrationIds: string[];
  onActivate: () => void;
  onDeactivate: () => void;
  onConfigure: () => void;
}

function reqKey(req: IntegrationRequirement) {
  return typeof req === "string" ? req : req.join("|");
}

function reqIsMissing(missing: IntegrationRequirement[], req: IntegrationRequirement) {
  const k = reqKey(req);
  return missing.some((m) => reqKey(m) === k);
}

export function CapabilityCard({
  capability: cap,
  enabled,
  missingIntegrations,
  connectedIntegrationIds,
  onActivate,
  onDeactivate,
  onConfigure,
}: Props) {
  const TIcon = triggerIcon[cap.trigger];
  const blocked = missingIntegrations.length > 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-[var(--radius-card)] border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[border-color] duration-300",
        enabled
          ? "border-accent/50"
          : blocked
            ? "border-warning/40"
            : "border-border hover:border-accent/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{cap.name}</p>
          <p className="mt-1 text-sm text-muted">{cap.description}</p>
        </div>
        {enabled ? (
          <Badge variant="accent">
            <Power className="h-3 w-3" /> Aktiv
          </Badge>
        ) : blocked ? (
          <Badge variant="warning">Integration fehlt</Badge>
        ) : (
          <Badge variant="outline">Inaktiv</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="default">
          <TIcon className="h-3 w-3" /> {triggerLabel[cap.trigger]}
          {cap.schedule && <span className="ml-1 text-muted">· {cap.schedule}</span>}
        </Badge>
        {cap.requiredIntegrations.map((req) => {
          const missing = reqIsMissing(missingIntegrations, req);
          if (typeof req === "string") {
            const int = getIntegration(req);
            if (!int) return null;
            return (
              <Badge key={req} variant={missing ? "warning" : "success"}>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: int.color }}
                  aria-hidden
                />
                {int.name}
              </Badge>
            );
          }
          // "Any of" requirement: show which is connected, or list alternatives.
          const connected = req.find((id) => connectedIntegrationIds.includes(id));
          if (connected) {
            const int = getIntegration(connected);
            if (!int) return null;
            return (
              <Badge key={reqKey(req)} variant="success">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: int.color }}
                  aria-hidden
                />
                {int.name}
              </Badge>
            );
          }
          const names = req
            .map((id) => getIntegration(id)?.name)
            .filter(Boolean)
            .join(" / ");
          return (
            <Badge key={reqKey(req)} variant="warning">
              {names}
            </Badge>
          );
        })}
      </div>

      <p className="text-xs text-ink-soft">
        <span className="font-semibold text-ink">Liefert: </span>
        {cap.output}
      </p>

      <div className="mt-auto flex items-center justify-end gap-2">
        {blocked ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/integrations">
              <Plug className="h-4 w-4" /> Integration verbinden
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : enabled ? (
          <>
            <Button variant="ghost" size="sm" onClick={onConfigure}>
              <Cog className="h-4 w-4" /> Konfigurieren
            </Button>
            <Button variant="outline" size="sm" onClick={onDeactivate}>
              Deaktivieren
            </Button>
          </>
        ) : (
          <Button variant="accent" size="sm" onClick={onActivate}>
            <Power className="h-4 w-4" /> Aktivieren
          </Button>
        )}
      </div>
    </div>
  );
}
