import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <span className="font-serif text-7xl font-semibold text-gradient-gold">404</span>
      <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
        Diese Seite existiert nicht.
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Die angeforderte Seite konnte nicht gefunden werden. Kehren Sie zurück zur
        Markenwelt von MAISON ELORIA.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Zur Startseite
        </Link>
      </Button>
    </Container>
  );
}
