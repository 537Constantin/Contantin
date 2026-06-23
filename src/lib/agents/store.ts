"use client";

import type { AgentRuntimeState, CapabilityState } from "@/lib/types";

/**
 * Client-side persistence for which integrations are connected and which
 * capabilities are enabled. localStorage today, swap for Prisma later — the
 * shape mirrors what the database tables will hold.
 */

const KEY = "workforce-os:agents";

const empty: AgentRuntimeState = {
  connectedIntegrations: [],
  capabilities: {},
};

export function loadAgentState(): AgentRuntimeState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as AgentRuntimeState;
    return {
      connectedIntegrations: Array.isArray(parsed.connectedIntegrations)
        ? parsed.connectedIntegrations
        : [],
      capabilities: parsed.capabilities ?? {},
    };
  } catch {
    return empty;
  }
}

export function saveAgentState(state: AgentRuntimeState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function isIntegrationConnected(state: AgentRuntimeState, id: string) {
  return state.connectedIntegrations.includes(id);
}

export function toggleIntegration(state: AgentRuntimeState, id: string): AgentRuntimeState {
  const has = isIntegrationConnected(state, id);
  return {
    ...state,
    connectedIntegrations: has
      ? state.connectedIntegrations.filter((c) => c !== id)
      : [...state.connectedIntegrations, id],
    capabilities: has
      ? // Disconnect: auto-disable any capability that required this integration.
        Object.fromEntries(
          Object.entries(state.capabilities).map(([capId, capState]) => [
            capId,
            { ...capState, enabled: capState.enabled },
          ]),
        )
      : state.capabilities,
  };
}

export function isCapabilityEnabled(state: AgentRuntimeState, id: string) {
  return state.capabilities[id]?.enabled === true;
}

export function setCapabilityState(
  state: AgentRuntimeState,
  id: string,
  patch: Partial<CapabilityState>,
): AgentRuntimeState {
  const current: CapabilityState = state.capabilities[id] ?? { enabled: false, config: {} };
  return {
    ...state,
    capabilities: {
      ...state.capabilities,
      [id]: { ...current, ...patch, config: { ...current.config, ...patch.config } },
    },
  };
}

export function missingIntegrationsFor(
  state: AgentRuntimeState,
  required: string[],
): string[] {
  return required.filter((id) => !isIntegrationConnected(state, id));
}
