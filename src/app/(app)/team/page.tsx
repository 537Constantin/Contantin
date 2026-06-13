"use client";

import * as React from "react";
import { UserPlus, Shield, Trash2, X, Mail, Check } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { team } from "@/lib/data/analytics";
import { loadItems, saveItems } from "@/lib/store-sync";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

const roleMeta = {
  owner: { label: "Eigentümer", variant: "accent" as const },
  admin: { label: "Admin", variant: "cyan" as const },
  member: { label: "Mitglied", variant: "default" as const },
  viewer: { label: "Betrachter", variant: "outline" as const },
};
type Role = keyof typeof roleMeta;
const invitableRoles: Role[] = ["admin", "member", "viewer"];

const palette = ["#7c6dff", "#2dd4ef", "#16b674", "#e0a106", "#b96bff", "#ef4658"];
const rid = () => Math.random().toString(36).slice(2, 9);

const auditLog = [
  { who: "Lena Hoffmann", action: "hat den Workflow „Support Triage“ aktiviert", when: "vor 2 Std." },
  { who: "Constantin Weber", action: "hat den KI-Mitarbeiter „Iris“ erstellt", when: "vor 5 Std." },
  { who: "Jonas Kraus", action: "hat 12 Dokumente hochgeladen", when: "vor 1 Tag" },
  { who: "System", action: "Wöchentlicher KPI-Report wurde versendet", when: "vor 2 Tagen" },
];

export default function TeamPage() {
  const [invited, setInvited] = React.useState<TeamMember[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [inviting, setInviting] = React.useState(false);

  React.useEffect(() => {
    loadItems<TeamMember>("member").then((m) => {
      setInvited(m);
      setLoaded(true);
    });
  }, []);
  React.useEffect(() => {
    if (loaded) void saveItems("member", invited);
  }, [invited, loaded]);

  const addMember = (m: TeamMember) => {
    setInvited((prev) => [m, ...prev]);
    setInviting(false);
  };
  const removeMember = (id: string) => setInvited((prev) => prev.filter((m) => m.id !== id));

  const members = [...team, ...invited];

  return (
    <PageShell>
      <PageHeader
        title="Team"
        description="Verwalte Mitglieder, Rollen und Berechtigungen für deinen Workspace."
      >
        <Button variant="accent" size="sm" onClick={() => setInviting((v) => !v)}>
          <UserPlus className="h-4 w-4" /> Mitglied einladen
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mitglieder</CardTitle>
            <Badge variant="default">{members.length} Personen</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {inviting && <InviteForm onAdd={addMember} onCancel={() => setInviting(false)} />}
            {members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                onRemove={invited.some((x) => x.id === m.id) ? () => removeMember(m.id) : undefined}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitätsprotokoll</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {auditLog.map((log, i) => (
                <li key={i} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-accent" />
                  {i < auditLog.length - 1 && <span className="absolute left-[3px] top-3.5 h-full w-px bg-border" />}
                  <p className="text-sm text-ink">
                    <span className="font-medium">{log.who}</span> {log.action}
                  </p>
                  <p className="text-xs text-muted">{log.when}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function InviteForm({ onAdd, onCancel }: { onAdd: (m: TeamMember) => void; onCancel: () => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("member");
  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email);

  function submit() {
    if (!valid) return;
    onAdd({
      id: `m-${rid()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      avatarColor: palette[Math.floor(Math.random() * palette.length)],
      lastActive: "eingeladen",
    });
  }

  const inputCls =
    "h-10 w-full rounded-lg border border-border bg-surface-soft/50 px-3 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-surface-soft/30 p-3.5 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium text-muted">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" className={inputCls} />
      </div>
      <div className="flex-1">
        <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted"><Mail className="h-3 w-3" /> E-Mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@firma.de" inputMode="email" className={inputCls} />
      </div>
      <div className="sm:w-36">
        <label className="mb-1.5 block text-xs font-medium text-muted">Rolle</label>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputCls}>
          {invitableRoles.map((r) => (
            <option key={r} value={r}>{roleMeta[r].label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button variant="accent" size="sm" onClick={submit} disabled={!valid}>
          <Check className="h-4 w-4" /> Einladen
        </Button>
        <button onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-soft hover:text-ink" aria-label="Abbrechen">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MemberRow({ member, onRemove }: { member: TeamMember; onRemove?: () => void }) {
  const rm = roleMeta[member.role];
  const pending = member.lastActive === "eingeladen";
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <Avatar name={member.name} color={member.avatarColor} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{member.name}</p>
        <p className="truncate text-sm text-muted">{member.email}</p>
      </div>
      <span className="hidden text-xs text-muted sm:block">
        {pending ? "Einladung offen" : member.lastActive === "now" ? "online" : member.lastActive}
      </span>
      <Badge variant={rm.variant}>
        {member.role === "owner" && <Shield className="h-3 w-3" />}
        {rm.label}
      </Badge>
      {onRemove ? (
        <button
          onClick={onRemove}
          className={cn("grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-danger")}
          aria-label={`${member.name} entfernen`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <span className="h-8 w-8" />
      )}
    </div>
  );
}
