"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap, CheckCircle2, Plus, Trash2, ChevronDown, Sparkles,
  AlertTriangle, ArrowRight, BookOpen, Lock,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowAvatar } from "@/components/ui/glow-avatar";
import { employees, getEmployee } from "@/lib/data/employees";
import {
  specializations, type Specialization, type UserSpecialization, type KnowledgeEntry,
} from "@/lib/data/specializations";
import { loadItems, saveItems } from "@/lib/store-sync";
import { cn } from "@/lib/utils";

const rid = () => Math.random().toString(36).slice(2, 9);

export default function SpecializationsPage() {
  const [userSpecs, setUserSpecs] = React.useState<UserSpecialization[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    loadItems<UserSpecialization>("specialization").then((s) => {
      setUserSpecs(s);
      setLoaded(true);
    });
  }, []);
  React.useEffect(() => {
    if (loaded) void saveItems("specialization", userSpecs);
  }, [userSpecs, loaded]);

  function patchUserSpec(id: string, patch: Partial<UserSpecialization>) {
    setUserSpecs((list) => {
      const existing = list.find((u) => u.id === id);
      const base: UserSpecialization = existing ?? { id, activated: false, customKnowledge: [], updatedAt: "" };
      const updated: UserSpecialization = { ...base, ...patch, updatedAt: new Date().toISOString() };
      return existing ? list.map((u) => (u.id === id ? updated : u)) : [...list, updated];
    });
  }

  const unlockedCount = userSpecs.filter((u) => u.activated).length;

  return (
    <PageShell>
      <PageHeader
        title="Spezialisierungen"
        description="Gib deinen KI-Mitarbeitern echtes Fachwissen – ohne Neu-Training. Freischalten, einem Mitarbeiter zuweisen, im Chat nutzen."
      >
        <Badge variant="accent"><GraduationCap className="h-3.5 w-3.5" /> {unlockedCount} freigeschaltet</Badge>
      </PageHeader>

      {/* How it works */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-surface-soft/40 p-3.5 text-sm text-ink-soft">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          <span className="font-medium text-ink">So funktioniert&apos;s:</span> Jede Spezialisierung ist eine
          Experten-Rolle plus eine Wissensdatenbank. Du kannst sie freischalten, einem KI-Mitarbeiter zuweisen und{" "}
          <span className="font-medium text-ink">eigenes Fachwissen ergänzen</span> – der Assistent antwortet dann als
          Fachkraft. Das Freischalten ist aktuell kostenlos (Demo); echte Bezahlung folgt. Für{" "}
          <span className="font-medium text-ink">echte</span> Antworten wird ein <code>OPENAI_API_KEY</code> benötigt.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {specializations.map((spec) => (
          <SpecCard
            key={spec.id}
            spec={spec}
            userSpec={userSpecs.find((u) => u.id === spec.id)}
            onPatch={patchUserSpec}
          />
        ))}
      </div>
    </PageShell>
  );
}

function SpecCard({
  spec,
  userSpec,
  onPatch,
}: {
  spec: Specialization;
  userSpec?: UserSpecialization;
  onPatch: (id: string, patch: Partial<UserSpecialization>) => void;
}) {
  const Icon = spec.icon;
  const activated = userSpec?.activated ?? false;
  const custom = userSpec?.customKnowledge ?? [];
  const assignedId = userSpec?.assignedEmployeeId ?? spec.defaultEmployeeId;
  const assigned = getEmployee(assignedId) ?? employees[0];
  const [showKnowledge, setShowKnowledge] = React.useState(false);

  return (
    <Card hover>
      <CardContent className="flex h-full flex-col p-5">
        {/* Head */}
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-surface-soft/60">
            <Icon className="h-5 w-5 text-ink" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-ink">{spec.name}</h3>
              {activated && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Freigeschaltet</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-muted">{spec.tagline}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-ink">{spec.priceLabel}</span>
        </div>

        <p className="mt-3 text-sm text-ink-soft">{spec.description}</p>

        {/* Sensitive disclaimer */}
        {spec.sensitive && spec.disclaimer && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{spec.disclaimer}</span>
          </div>
        )}

        {/* Knowledge count */}
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
          <BookOpen className="h-3.5 w-3.5" />
          {spec.knowledge.length + custom.length} Wissenseinträge
          {custom.length > 0 && <span className="text-accent">· {custom.length} von dir</span>}
        </p>

        {!activated ? (
          <div className="mt-4">
            <Button variant="accent" size="sm" onClick={() => onPatch(spec.id, { activated: true, assignedEmployeeId: spec.defaultEmployeeId })}>
              <Lock className="h-4 w-4" /> Freischalten
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Assignment */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-soft/40 p-2.5">
              <GlowAvatar name={assigned.name} color={assigned.avatarColor} size="sm" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted">Zugewiesen an</p>
                <select
                  value={assignedId}
                  onChange={(e) => onPatch(spec.id, { assignedEmployeeId: e.target.value })}
                  className="max-w-[180px] truncate rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-ink focus:border-accent/40 focus:outline-none"
                  aria-label="Mitarbeiter zuweisen"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} · {e.roleLabel}</option>
                  ))}
                </select>
              </div>
              <Link
                href={`/chat?agent=${encodeURIComponent(assignedId)}`}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                Im Chat testen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowKnowledge((v) => !v)}>
                <BookOpen className="h-4 w-4" /> Wissen verwalten
                <ChevronDown className={cn("h-4 w-4 transition-transform", showKnowledge && "rotate-180")} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onPatch(spec.id, { activated: false })}>
                Deaktivieren
              </Button>
            </div>

            {showKnowledge && (
              <KnowledgePanel
                spec={spec}
                custom={custom}
                onChange={(next) => onPatch(spec.id, { customKnowledge: next })}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KnowledgePanel({
  spec,
  custom,
  onChange,
}: {
  spec: Specialization;
  custom: KnowledgeEntry[];
  onChange: (next: KnowledgeEntry[]) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  function add() {
    if (!title.trim() || !content.trim()) return;
    onChange([...custom, { id: rid(), title: title.trim(), content: content.trim() }]);
    setTitle("");
    setContent("");
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-soft/30 p-3">
      {/* Built-in knowledge */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Enthaltenes Fachwissen</p>
        <div className="space-y-1.5">
          {spec.knowledge.map((e) => (
            <details key={e.id} className="rounded-lg border border-border bg-surface px-2.5 py-1.5">
              <summary className="cursor-pointer text-xs font-medium text-ink">{e.title}</summary>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{e.content}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Custom knowledge */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Dein eigenes Fachwissen</p>
        {custom.length > 0 ? (
          <div className="space-y-1.5">
            {custom.map((e) => (
              <div key={e.id} className="flex items-start gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink">{e.title}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-ink-soft">{e.content}</p>
                </div>
                <button
                  onClick={() => onChange(custom.filter((c) => c.id !== e.id))}
                  className="shrink-0 rounded-md p-1 text-muted hover:bg-surface-soft hover:text-danger"
                  aria-label="Eintrag löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">Noch nichts ergänzt. Füge unten dein eigenes Wissen hinzu (z. B. eure Preise, Abläufe, Richtlinien).</p>
        )}
      </div>

      {/* Add form */}
      <div className="space-y-2 border-t border-border pt-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel (z. B. Unsere Preise)"
          className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Inhalt – das Wissen, das der Assistent kennen soll …"
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
        />
        <Button variant="accent" size="sm" onClick={add} disabled={!title.trim() || !content.trim()}>
          <Plus className="h-4 w-4" /> Wissen hinzufügen
        </Button>
      </div>
    </div>
  );
}
