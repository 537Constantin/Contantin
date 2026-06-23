"use client";

import * as React from "react";
import Link from "next/link";
import { Plug, Sparkles, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CapabilityCard } from "@/components/agents/capability-card";
import { SetupDialog } from "@/components/agents/setup-dialog";
import {
  capabilities,
  capabilitiesForRole,
  capabilityCategoryLabel,
} from "@/lib/agents/capabilities";
import {
  loadAgentState,
  saveAgentState,
  missingIntegrationsFor,
  setCapabilityState,
  isCapabilityEnabled,
} from "@/lib/agents/store";
import type {
  AgentRuntimeState,
  AIEmployee,
  Capability,
  CapabilityCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function AgentCapabilities({ employee }: { employee: AIEmployee }) {
  const [state, setState] = React.useState<AgentRuntimeState>({
    connectedIntegrations: [],
    capabilities: {},
  });
  const [loaded, setLoaded] = React.useState(false);
  const [dialog, setDialog] = React.useState<Capability | null>(null);
  const [scope, setScope] = React.useState<"role" | "all">("role");

  React.useEffect(() => {
    setState(loadAgentState());
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (loaded) saveAgentState(state);
  }, [state, loaded]);

  const list: Capability[] = scope === "role" ? capabilitiesForRole(employee.role) : capabilities;

  const grouped = React.useMemo(() => {
    const map = new Map<CapabilityCategory, Capability[]>();
    for (const c of list) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return map;
  }, [list]);

  const counts = {
    total: list.length,
    enabled: list.filter((c) => isCapabilityEnabled(state, c.id)).length,
    blocked: list.filter(
      (c) =>
        !isCapabilityEnabled(state, c.id) &&
        missingIntegrationsFor(state, c.requiredIntegrations).length > 0,
    ).length,
  };

  const connectedCount = state.connectedIntegrations.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Fähigkeiten & Aufgaben</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Konkrete Jobs, die {employee.name} übernehmen kann.{" "}
              <span className="text-ink">{counts.enabled}</span> von{" "}
              <span className="text-ink">{counts.total}</span> aktiv
              {counts.blocked > 0 && (
                <span className="text-warning">
                  {" · "}
                  {counts.blocked} warten auf Integration
                </span>
              )}
              .
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/integrations">
                <Plug className="h-4 w-4" /> Integrationen ({connectedCount})
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <button
              onClick={() => setScope("role")}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                scope === "role" ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink",
              )}
            >
              Für {employee.roleLabel}
            </button>
            <button
              onClick={() => setScope("all")}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                scope === "all" ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink",
              )}
            >
              Alle Aufgaben anzeigen
            </button>
          </div>

          {grouped.size === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-soft/30 p-6 text-center text-sm text-muted">
              Für diese Rolle sind noch keine Aufgaben definiert. Wechsle zu „Alle Aufgaben
              anzeigen“, um etwas Passendes zu finden.
            </p>
          ) : (
            <div className="space-y-7">
              {[...grouped.entries()].map(([cat, caps]) => (
                <div key={cat}>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                      {capabilityCategoryLabel[cat]}
                    </h3>
                    <Badge variant="outline">{caps.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {caps.map((c) => (
                      <CapabilityCard
                        key={c.id}
                        capability={c}
                        enabled={isCapabilityEnabled(state, c.id)}
                        missingIntegrations={missingIntegrationsFor(state, c.requiredIntegrations)}
                        onActivate={() => setDialog(c)}
                        onConfigure={() => setDialog(c)}
                        onDeactivate={() =>
                          setState((s) => setCapabilityState(s, c.id, { enabled: false }))
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-soft/30 p-4 text-sm text-muted">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>
              Jede aktivierte Aufgabe läuft nach ihrem Trigger (Ereignis, Zeitplan oder
              manuell). Aktivierungen + Konfigurationen bleiben im Browser gespeichert,
              bis die Datenbank scharfgeschaltet ist.
            </span>
          </div>
        </CardContent>
      </Card>

      <SetupDialog
        open={dialog !== null}
        capability={dialog}
        initialConfig={dialog ? state.capabilities[dialog.id]?.config : undefined}
        missingIntegrations={
          dialog ? missingIntegrationsFor(state, dialog.requiredIntegrations) : []
        }
        onClose={() => setDialog(null)}
        onSave={(capState) => {
          if (!dialog) return;
          setState((s) => setCapabilityState(s, dialog.id, capState));
          setDialog(null);
        }}
      />
    </>
  );
}
