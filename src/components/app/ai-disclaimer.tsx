import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Consistent "AI can be wrong" notice, shown everywhere the app surfaces a
 * generated result (chat, workflows, phone simulator, recommendations).
 */
export function AiDisclaimer({
  text = "Von KI erstellt – kann Fehler enthalten. Bitte vor der Verwendung prüfen.",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-muted", className)}>
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
      {text}
    </p>
  );
}
