import type { Metadata } from "next";
import { UserPlus, Shield, MoreHorizontal } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { team } from "@/lib/data/analytics";
import type { TeamMember } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

const roleMeta = {
  owner: { label: "Eigentümer", variant: "accent" as const },
  admin: { label: "Admin", variant: "cyan" as const },
  member: { label: "Mitglied", variant: "default" as const },
  viewer: { label: "Betrachter", variant: "outline" as const },
};

const auditLog = [
  { who: "Lena Hoffmann", action: "hat den Workflow „Support Triage“ aktiviert", when: "vor 2 Std." },
  { who: "Constantin Weber", action: "hat den KI-Mitarbeiter „Iris“ erstellt", when: "vor 5 Std." },
  { who: "Jonas Kraus", action: "hat 12 Dokumente hochgeladen", when: "vor 1 Tag" },
  { who: "System", action: "Wöchentlicher KPI-Report wurde versendet", when: "vor 2 Tagen" },
];

export default function TeamPage() {
  return (
    <PageShell>
      <PageHeader
        title="Team"
        description="Verwalte Mitglieder, Rollen und Berechtigungen für deinen Workspace."
      >
        <Button variant="accent" size="sm">
          <UserPlus className="h-4 w-4" /> Mitglied einladen
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mitglieder</CardTitle>
            <Badge variant="default">{team.length} Personen</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {team.map((m) => (
              <MemberRow key={m.id} member={m} />
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

function MemberRow({ member }: { member: TeamMember }) {
  const rm = roleMeta[member.role];
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <Avatar name={member.name} color={member.avatarColor} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{member.name}</p>
        <p className="truncate text-sm text-muted">{member.email}</p>
      </div>
      <span className="hidden text-xs text-muted sm:block">{member.lastActive === "now" ? "online" : member.lastActive}</span>
      <Badge variant={rm.variant}>
        {member.role === "owner" && <Shield className="h-3 w-3" />}
        {rm.label}
      </Badge>
      <button className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink" aria-label="Optionen">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
