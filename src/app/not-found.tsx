import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <span className="font-display text-7xl font-bold text-gradient-brand">404</span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
          Diese Seite existiert nicht.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Die angeforderte Seite konnte nicht gefunden werden. Zurück zu deiner KI-Belegschaft.
        </p>
        <Button asChild size="lg" variant="accent" className="mt-8">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Zum Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
