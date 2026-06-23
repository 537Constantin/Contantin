"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Zap, Hand, Webhook, Plug, Power, Cog, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Capability, TriggerKind } from "@/lib/types";
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
  missingIntegrations: string[];
  onActivate: () => void;
  onDeactivate: () => void;
  onConfigure: () => void;
}

export function CapabilityCard({
  capability: cap,
  enabled,
  missingIntegrations,
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
        {cap.requiredIntegrations.map((id) => {
          const int = getIntegration(id);
          if (!int) return null;
          const missing = missingIntegrations.includes(id);
          return (
            <Badge key={id} variant={missing ? "warning" : "success"}>
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: int.color }}
                aria-hidden
              />
              {int.name}
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
