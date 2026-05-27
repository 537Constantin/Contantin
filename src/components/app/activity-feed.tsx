import { Phone, Mail, CalendarCheck, FileText, CheckSquare, Workflow, Lightbulb, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { employees } from "@/lib/data/employees";
import type { ActivityEvent, ActivityKind } from "@/lib/types";

const kindMeta: Record<ActivityKind, { icon: LucideIcon; tone: string }> = {
  call: { icon: Phone, tone: "var(--color-success)" },
  email: { icon: Mail, tone: "var(--color-cyan)" },
  meeting: { icon: CalendarCheck, tone: "var(--color-accent)" },
  document: { icon: FileText, tone: "var(--color-violet)" },
  task: { icon: CheckSquare, tone: "var(--color-warning)" },
  workflow: { icon: Workflow, tone: "var(--color-accent)" },
  insight: { icon: Lightbulb, tone: "var(--color-cyan)" },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ul className="space-y-1">
      {events.map((ev) => {
        const emp = employees.find((e) => e.id === ev.employeeId);
        const { icon: Icon, tone } = kindMeta[ev.kind];
        return (
          <li
            key={ev.id}
            className="flex gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-soft/60"
          >
            <span
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{ev.title}</p>
              <p className="truncate text-sm text-muted">{ev.detail}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-xs text-muted">{formatRelativeTime(ev.at)}</span>
              {emp && <Avatar name={emp.name} color={emp.avatarColor} size="sm" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
