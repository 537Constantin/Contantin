/**
 * User-created AI employees.
 *
 * The built-in team in `data/employees.ts` is static. On top of that, users can
 * create their own employees ("Neuer KI-Mitarbeiter"). Those are stored per-user
 * under the "employee" store kind (DB via /api/store, with localStorage
 * fallback) — exactly like workflows, documents and specializations.
 *
 * `useEmployees()` is the single source every client page uses to get the full
 * roster (built-in + custom merged), so a created employee shows up everywhere:
 * the team list, the chat picker, workflows, the phone assistant and
 * specializations.
 */
"use client";

import * as React from "react";
import type { AIEmployee, EmployeeRole, Personality } from "@/lib/types";
import { employees, roleMeta } from "@/lib/data/employees";
import { loadItems, saveItems } from "@/lib/store-sync";

const EMPLOYEE_KIND = "employee" as const;
const rid = () => Math.random().toString(36).slice(2, 9);

/** Custom employees carry an `emp-u-` id so they can be told apart from built-ins. */
export const isCustomEmployee = (id: string) => id.startsWith("emp-u-");

/** Build a complete employee from the role template + the user's choices. */
export function buildUserEmployee(input: { name: string; role: EmployeeRole; personality: Personality }): AIEmployee {
  const meta = roleMeta[input.role];
  const name = input.name.trim();
  return {
    id: `emp-u-${rid()}`,
    name,
    role: input.role,
    roleLabel: meta.label,
    avatarColor: meta.color,
    status: "active",
    personality: input.personality,
    description: `${name} ist dein ${meta.label}. Zuständig für: ${meta.blurb}.`,
    skills: [...meta.defaultSkills],
    tools: [...meta.defaultTools],
    model: "gpt-4o-mini",
    performance: 80,
    tasksCompleted: 0,
    tasksOpen: 0,
    interactions: 0,
    hoursSaved: 0,
    createdAt: new Date().toISOString(),
  };
}

export function loadUserEmployees(): Promise<AIEmployee[]> {
  return loadItems<AIEmployee>(EMPLOYEE_KIND);
}

/** The persona fields the chat/workflow APIs need to act as a custom employee. */
export interface AgentPersona {
  name: string;
  roleLabel: string;
  description: string;
  skills: string[];
  personality: string;
}
export function agentPersona(emp: AIEmployee): AgentPersona {
  return {
    name: emp.name,
    roleLabel: emp.roleLabel,
    description: emp.description,
    skills: emp.skills,
    personality: emp.personality,
  };
}

/**
 * Load the full roster (built-in + the current user's custom employees) and
 * expose helpers to add/remove custom ones (auto-persisted), mirroring how the
 * workflows/calls pages manage their own data.
 */
export function useEmployees() {
  const [custom, setCustom] = React.useState<AIEmployee[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    loadUserEmployees().then((list) => {
      setCustom(list);
      setLoaded(true);
    });
  }, []);

  React.useEffect(() => {
    if (loaded) void saveItems(EMPLOYEE_KIND, custom);
  }, [custom, loaded]);

  const add = React.useCallback((emp: AIEmployee) => setCustom((prev) => [emp, ...prev]), []);
  const remove = React.useCallback((id: string) => setCustom((prev) => prev.filter((e) => e.id !== id)), []);

  const all = React.useMemo<AIEmployee[]>(() => [...employees, ...custom], [custom]);
  const find = React.useCallback((id: string) => all.find((e) => e.id === id), [all]);

  return { all, custom, loaded, add, remove, find };
}
