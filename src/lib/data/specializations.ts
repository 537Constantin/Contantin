/**
 * Specialization catalog ("buy expertise for your AI employees").
 *
 * A specialization gives an AI employee domain expertise WITHOUT retraining the
 * model: it adds (1) an expert persona and (2) a knowledge base. When the
 * employee answers, this expertise + knowledge is injected into its context, so
 * it responds like a specialist. Knowledge is instantly editable and additive.
 *
 * The catalog here is static (the packs you can unlock). Per-user state — which
 * packs are unlocked, which employee they're assigned to, and any knowledge the
 * user added — is stored separately via store-sync under the "specialization"
 * kind (see UserSpecialization).
 */
import {
  Megaphone, Calculator, Receipt, TrendingUp, type LucideIcon,
} from "lucide-react";

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
}

export interface Specialization {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  icon: LucideIcon;
  /** Display-only for now (real payment via Stripe comes later). */
  priceLabel: string;
  /** Employee this pack is assigned to by default when unlocked. */
  defaultEmployeeId: string;
  /** Expert persona / instructions this specialization adds. */
  expertise: string;
  /** Built-in starter knowledge that ships with the pack. */
  knowledge: KnowledgeEntry[];
  /** Domains that need a "not a substitute for a professional" note. */
  sensitive?: boolean;
  disclaimer?: string;
}

/** Per-user state for a specialization (stored under the "specialization" kind). */
export interface UserSpecialization {
  id: string; // = specialization id
  activated: boolean;
  assignedEmployeeId?: string;
  customKnowledge: KnowledgeEntry[];
  updatedAt: string;
}

const k = (id: string, title: string, content: string): KnowledgeEntry => ({ id, title, content });

export const specializations: Specialization[] = [
  {
    id: "spec-marketing",
    name: "Marketing",
    tagline: "Kampagnen, Content & Markenkommunikation",
    description: "Macht den Assistenten zum Marketing-Profi: Strategie, Content, SEO, Social Media und überzeugende Werbetexte.",
    category: "Business",
    icon: Megaphone,
    priceLabel: "29 €/Monat",
    defaultEmployeeId: "emp-marcus",
    expertise:
      "Du bist ein erfahrener Marketing-Spezialist (B2B & B2C) mit Fokus auf Content-Strategie, SEO, Performance-Marketing, Social Media und Markenführung. Du denkst in Zielgruppen, klaren Nutzenversprechen und messbaren Ergebnissen (KPIs) und lieferst konkrete, umsetzbare Vorschläge statt Allgemeinplätze.",
    knowledge: [
      k("m1", "AIDA-Formel für Werbetexte", "Jeder gute Werbetext folgt: Attention (Aufmerksamkeit mit Headline), Interest (Interesse durch Relevanz), Desire (Verlangen über Nutzen und Emotion), Action (klarer Handlungsaufruf). Immer einen konkreten Call-to-Action setzen."),
      k("m2", "Wichtige Marketing-KPIs", "CAC = Marketingkosten geteilt durch Neukunden. CTR = Klicks geteilt durch Impressionen. Conversion-Rate = Abschlüsse geteilt durch Besucher. ROAS = Umsatz geteilt durch Werbeausgaben. Ziel: CAC kleiner als Kundenwert (LTV)."),
      k("m3", "Kanäle & Formate", "LinkedIn = B2B und Fachpublikum. Instagram/TikTok = visuell, Reichweite, jüngere Zielgruppen. Newsletter = Bestandskunden und Wiederkäufe. SEO/Blog = langfristige, kostenlose Reichweite. Kanal immer zur Zielgruppe wählen."),
    ],
  },
  {
    id: "spec-bwl",
    name: "BWL & Finanzen",
    tagline: "Betriebswirtschaft, Controlling & Kennzahlen",
    description: "Macht den Assistenten zum BWL-/Finanz-Profi: Kalkulation, Liquidität, Kennzahlen und Businesspläne.",
    category: "Business",
    icon: Calculator,
    priceLabel: "39 €/Monat",
    defaultEmployeeId: "emp-iris",
    expertise:
      "Du bist ein erfahrener Betriebswirt (BWL) mit Schwerpunkt Finanzen, Controlling und Unternehmensführung. Du erklärst betriebswirtschaftliche Zusammenhänge klar und verständlich, rechnest sauber Schritt für Schritt und gibst fundierte, praxisnahe Empfehlungen für kleine und mittlere Unternehmen.",
    knowledge: [
      k("b1", "Deckungsbeitrag", "Deckungsbeitrag (DB) = Erlös minus variable Kosten. Er zeigt, was zur Deckung der Fixkosten und zum Gewinn übrig bleibt. Break-even: Fixkosten geteilt durch DB pro Stück = nötige Absatzmenge."),
      k("b2", "Wichtige Kennzahlen", "EBIT = Gewinn vor Zinsen und Steuern (operative Ertragskraft). Cashflow = tatsächlicher Geldfluss. Liquiditätsgrad = liquide Mittel geteilt durch kurzfristige Verbindlichkeiten. Eigenkapitalquote = Eigenkapital geteilt durch Gesamtkapital."),
      k("b3", "Liquiditätsplanung", "Stelle erwartete Einzahlungen den Auszahlungen je Zeitraum gegenüber. Wichtig ist der Zeitpunkt, nicht nur die Höhe: Ein profitables Unternehmen kann trotzdem zahlungsunfähig werden, wenn Geld zu spät eingeht."),
    ],
  },
  {
    id: "spec-steuern",
    name: "Steuern & Buchhaltung",
    tagline: "Steuer-Grundlagen für Unternehmen (DE)",
    description: "Macht den Assistenten zum Steuer-Helfer: Umsatzsteuer, Belege und Grundlagen – als Unterstützung, nicht als Ersatz für den Steuerberater.",
    category: "Business",
    icon: Receipt,
    priceLabel: "39 €/Monat",
    defaultEmployeeId: "emp-iris",
    sensitive: true,
    disclaimer: "Allgemeine Hinweise, kein Ersatz für eine individuelle Steuerberatung. Bei konkreten Fällen einen Steuerberater hinzuziehen; Grenzen, Sätze und Fristen können sich ändern – bitte aktuell prüfen.",
    expertise:
      "Du bist ein versierter Steuer-Assistent mit Fokus auf das deutsche Steuerrecht für kleine und mittlere Unternehmen (Umsatzsteuer, Einkommensteuer, Belege, Buchhaltung). Du gibst allgemeine, gut erklärte Hinweise, erfindest niemals Paragrafen, Sätze oder Fristen und machst klar, wann ein Steuerberater hinzugezogen werden sollte.",
    knowledge: [
      k("s1", "Umsatzsteuer – Grundlagen", "In Deutschland gilt in der Regel der Regelsteuersatz (aktuell 19 %) oder der ermäßigte Satz (aktuell 7 %, z. B. für viele Lebensmittel und Bücher). Unternehmen weisen die USt auf Rechnungen aus und führen sie ans Finanzamt ab; gezahlte Vorsteuer kann gegengerechnet werden."),
      k("s2", "Kleinunternehmerregelung (Paragraf 19 UStG)", "Wer unter bestimmten Umsatzgrenzen bleibt, kann die Kleinunternehmerregelung nutzen und keine USt ausweisen. Die genauen Grenzen wurden zuletzt angehoben – aktuelle Werte bitte beim Finanzamt oder Steuerberater prüfen."),
      k("s3", "Pflichtangaben auf Rechnungen", "Vollständige Rechnung u. a.: Name/Anschrift beider Seiten, Steuernummer oder USt-IdNr., Datum, fortlaufende Rechnungsnummer, Menge/Art der Leistung, Entgelt, Steuersatz und Steuerbetrag."),
    ],
  },
  {
    id: "spec-vertrieb",
    name: "Vertrieb & Sales",
    tagline: "Akquise, Gesprächsführung & Abschluss",
    description: "Macht den Assistenten zum Vertriebs-Profi: Leadgenerierung, Einwandbehandlung, Verhandlung und Abschlusstechniken.",
    category: "Business",
    icon: TrendingUp,
    priceLabel: "29 €/Monat",
    defaultEmployeeId: "emp-leo",
    expertise:
      "Du bist ein erfahrener Vertriebsprofi mit Fokus auf B2B-Sales: Akquise, Gesprächsführung, Einwandbehandlung und Abschlusstechniken. Du bist überzeugend, aber nie aufdringlich, und stellst immer den echten Kundennutzen in den Mittelpunkt.",
    knowledge: [
      k("v1", "Lead-Qualifizierung (BANT)", "Prüfe vier Dinge, bevor du Zeit investierst: Budget (ist Geld da?), Authority (rede ich mit dem Entscheider?), Need (gibt es einen echten Bedarf?), Timing (wann soll es passieren?)."),
      k("v2", "Einwandbehandlung", "Bewährtes Muster: 1) Einwand anerkennen (nicht sofort dagegenreden), 2) hinterfragen und verstehen, 3) mit konkretem Nutzen oder Beleg entkräften, 4) zum nächsten Schritt führen. Der Einwand 'zu teuer' heißt oft nur, dass der Nutzen noch nicht klar genug ist."),
      k("v3", "Verkaufsphasen", "Erstkontakt, Bedarfsanalyse (zuhören!), Lösung/Angebot, Einwandbehandlung, Abschluss, Nachfassen. In jeder Phase ein klares nächstes Commitment vereinbaren."),
    ],
  },
];

export function getSpecialization(id: string) {
  return specializations.find((s) => s.id === id);
}

/** Build the expertise text injected into an employee's context. Caps length. */
export function buildExpertise(spec: Specialization, custom: KnowledgeEntry[] = []): string {
  const all = [...spec.knowledge, ...custom];
  const knowledge = all.map((e) => `## ${e.title}\n${e.content}`).join("\n\n");
  const parts = [
    `Zusätzliche Spezialisierung: ${spec.name}. ${spec.expertise}`,
    spec.disclaimer ? `Mache bei Bedarf transparent: ${spec.disclaimer}` : "",
    all.length
      ? `Nutze das folgende Fachwissen, wenn es zur Frage passt. Erfinde nichts hinzu – wenn etwas nicht abgedeckt ist, sage es ehrlich.\n\n[Fachwissen]\n${knowledge}`
      : "",
  ].filter(Boolean);
  return parts.join("\n\n").slice(0, 12000);
}
