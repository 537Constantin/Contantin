import { cn } from "@/lib/utils";
import type { EmployeeStatus } from "@/lib/types";

export const statusMeta: Record<
  EmployeeStatus,
  { label: string; color: string; dot: string }
> = {
  active: { label: "Aktiv", color: "text-success", dot: "bg-success" },
  idle: { label: "Bereit", color: "text-muted", dot: "bg-muted" },
  training: { label: "Lernt", color: "text-warning", dot: "bg-warning" },
  offline: { label: "Offline", color: "text-muted", dot: "bg-border" },
};

export function StatusDot({ status, className }: { status: EmployeeStatus; className?: string }) {
  const m = statusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", m.color, className)}>
      <span className="relative flex h-2 w-2">
        {status === "active" && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", m.dot)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", m.dot)} />
      </span>
      {m.label}
    </span>
  );
}
