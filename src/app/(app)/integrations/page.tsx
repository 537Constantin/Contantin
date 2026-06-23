"use client";

import * as React from "react";
import { Plug } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { IntegrationCard } from "@/components/agents/integration-card";
import { integrations, integrationCategories } from "@/lib/agents/integrations";
import {
  loadAgentState,
  saveAgentState,
  toggleIntegration,
  isIntegrationConnected,
} from "@/lib/agents/store";
import type { AgentRuntimeState, IntegrationCategory } from "@/lib/types";

export default function IntegrationsPage() {
  const [state, setState] = React.useState<AgentRuntimeState>({
    connectedIntegrations: [],
    capabilities: {},
  });
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setState(loadAgentState());
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (loaded) saveAgentState(state);
  }, [state, loaded]);

  const toggle = (id: string) => setState((s) => toggleIntegration(s, id));

  const grouped = React.useMemo(() => {
    const map = new Map<IntegrationCategory, typeof integrations>();
    for (const i of integrations) {
      if (!map.has(i.category)) map.set(i.category, []);
      map.get(i.category)!.push(i);
    }
    return map;
  }, []);

  const connectedCount = state.connectedIntegrations.length;

  return (
    <PageShell>
      <PageHeader
        title="Integrationen"
        description="Verbinde die Werkzeuge, mit denen deine KI-Mitarbeiter arbeiten sollen. Eine Aufgabe lässt sich erst aktivieren, wenn alle benötigten Integrationen verbunden sind."
      >
        <Badge variant={connectedCount > 0 ? "success" : "default"}>
          <Plug className="h-3 w-3" /> {connectedCount} verbunden
        </Badge>
      </PageHeader>

      <div className="mt-6 space-y-8">
        {(Object.keys(integrationCategories) as IntegrationCategory[]).map((cat) => {
          const items = grouped.get(cat) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {integrationCategories[cat]}
                </h2>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((i) => (
                  <IntegrationCard
                    key={i.id}
                    integration={i}
                    connected={isIntegrationConnected(state, i.id)}
                    onConnect={() => toggle(i.id)}
                    onDisconnect={() => toggle(i.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-border bg-surface-soft/30 p-5 text-sm text-muted">
        <p className="font-semibold text-ink">Hinweis zur Verbindung</p>
        <p className="mt-1">
          Der Verbindungs-Schritt wird hier zunächst nur registriert. Sobald du einen
          echten Anwendungsfall live nehmen möchtest, schalten wir die jeweilige
          OAuth-/API-Verbindung scharf — der Rest der App (Aufgaben, Berechtigungen,
          Gates) ist bereits genau dafür gebaut.
        </p>
      </div>
    </PageShell>
  );
}
