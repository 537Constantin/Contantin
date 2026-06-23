"use client";

import * as React from "react";
import { Check, Plug, AlertCircle, KeyRound, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Integration } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  integration: Integration;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const authBadge = {
  oauth: { label: "OAuth", icon: Plug },
  api_key: { label: "API-Key", icon: KeyRound },
  internal: { label: "Eingebaut", icon: Check },
} as const;

export function IntegrationCard({ integration, connected, onConnect, onDisconnect }: Props) {
  const A = authBadge[integration.auth];
  const Icon = A.icon;
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-[var(--radius-card)] border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[transform,border-color,box-shadow] duration-300 [transition-timing-function:var(--ease-lux)]",
        connected ? "border-success/40" : "border-border hover:-translate-y-0.5 hover:border-accent/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold text-white"
            style={{ background: integration.color }}
            aria-hidden
          >
            {integration.badge}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{integration.name}</p>
            <p className="text-xs text-muted">{integration.provider}</p>
          </div>
        </div>
        <Badge variant={connected ? "success" : "outline"}>
          <Icon className="h-3 w-3" /> {connected ? "Verbunden" : A.label}
        </Badge>
      </div>

      <p className="text-sm text-ink-soft">{integration.description}</p>

      <div className="mt-auto rounded-xl bg-surface-soft/50 p-3 text-xs text-ink-soft">
        <span className="font-semibold text-ink">Schaltet frei: </span>
        {integration.unlocks}
      </div>

      <div className="flex items-center justify-between gap-2">
        {integration.docsUrl ? (
          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
          >
            Doku <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span />
        )}

        {connected ? (
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            Trennen
          </Button>
        ) : integration.auth === "api_key" ? (
          <Button variant="accent" size="sm" onClick={onConnect}>
            <KeyRound className="h-4 w-4" /> Verbinden
          </Button>
        ) : integration.auth === "internal" ? (
          <Badge variant="success">
            <Check className="h-3 w-3" /> Aktiv
          </Badge>
        ) : (
          <Button variant="accent" size="sm" onClick={onConnect}>
            <Plug className="h-4 w-4" /> Verbinden
          </Button>
        )}
      </div>

      {integration.auth === "api_key" && !connected && integration.envVar && (
        <p className="flex items-center gap-1 text-[11px] text-muted">
          <AlertCircle className="h-3 w-3" />
          ENV-Variable: <code className="font-mono">{integration.envVar}</code>
        </p>
      )}
    </div>
  );
}
