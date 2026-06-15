import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/legal-shell";
import { legal } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `AGB · ${siteConfig.name}`,
  description: "Allgemeine Geschäftsbedingungen für die Nutzung des Dienstes.",
};

export default function AgbPage() {
  return (
    <LegalShell title="Allgemeine Geschäftsbedingungen (AGB)" updated={legal.lastUpdated}>
      <LegalSection title="§ 1 Geltungsbereich">
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der von {legal.companyName}{" "}
          (nachfolgend &bdquo;Anbieter&ldquo;) bereitgestellten Software-as-a-Service-Anwendung {siteConfig.name}{" "}
          (nachfolgend &bdquo;Dienst&ldquo;) durch den Nutzer.
        </p>
      </LegalSection>

      <LegalSection title="§ 2 Vertragsgegenstand und Leistungen">
        <p>
          Der Dienst stellt KI-gestützte Assistenten und Automatisierungen bereit. Dazu gehören insbesondere:
          ein Chat mit konfigurierbaren KI-Mitarbeitern, ausführbare Workflows, fachliche Spezialisierungen
          (Wissenspakete), die Analyse hochgeladener Dokumente, ein Diagramm-Generator, ein Telefon-Assistent
          sowie Team- und Mitarbeiterverwaltung. Der konkrete Leistungsumfang ergibt sich aus der jeweils
          gewählten Leistungsbeschreibung und dem aktuellen Funktionsstand der Anwendung.
        </p>
        <p>
          <strong>Hinweis zum aktuellen Funktionsstand:</strong> Einzelne Funktionen können je nach
          Konfiguration als Demo bereitgestellt sein. Insbesondere ist der Telefon-Assistent derzeit eine
          textbasierte Testumgebung (Simulator) und nimmt keine echten Anrufe entgegen; echte Zahlungen,
          Anmeldung und E-Mail-Versand sind nur bei entsprechend aktivierten Diensten verfügbar.
        </p>
        <p>
          <strong>Hinweis zu KI-Ergebnissen:</strong> Die vom Dienst erzeugten Ausgaben werden automatisiert
          durch KI-Modelle erstellt und können unrichtig, unvollständig oder unpassend sein. Sie stellen
          keine Rechts-, Steuer-, Finanz- oder medizinische Beratung dar. Der Nutzer ist verpflichtet,
          Ergebnisse vor einer Verwendung eigenverantwortlich zu prüfen.
        </p>
      </LegalSection>

      <LegalSection title="§ 3 Vertragsschluss und Registrierung">
        <p>
          Der Vertrag kommt mit der Registrierung bzw. der Buchung einer Leistung zustande. Der Nutzer ist
          verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen und seine Zugangsdaten geheim
          zu halten.
        </p>
      </LegalSection>

      <LegalSection title="§ 4 Preise und Zahlung">
        <p>
          Es gelten die zum Zeitpunkt der Buchung angegebenen Preise. Die Abrechnung erfolgt – sofern
          kostenpflichtige Leistungen aktiviert sind – über den eingebundenen Zahlungsdienstleister. Während
          einer etwaigen Test- oder Demophase können Leistungen kostenfrei bereitgestellt werden.
        </p>
      </LegalSection>

      <LegalSection title="§ 5 Pflichten des Nutzers">
        <p>
          Der Nutzer verpflichtet sich, den Dienst nicht rechtswidrig zu nutzen, insbesondere keine
          rechtsverletzenden, beleidigenden oder strafbaren Inhalte zu verarbeiten. Für die von ihm
          eingegebenen Daten und die erforderlichen Rechte (z. B. an hochgeladenen Dokumenten) ist der Nutzer
          selbst verantwortlich.
        </p>
      </LegalSection>

      <LegalSection title="§ 6 Verfügbarkeit">
        <p>
          Der Anbieter bemüht sich um eine hohe Verfügbarkeit des Dienstes, schuldet jedoch keine
          ununterbrochene Verfügbarkeit. Wartungsarbeiten, Störungen bei Drittanbietern oder höhere Gewalt
          können zu Einschränkungen führen.
        </p>
      </LegalSection>

      <LegalSection title="§ 7 Haftung">
        <p>
          Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei der Verletzung von
          Leben, Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haftet der Anbieter nur bei Verletzung
          einer wesentlichen Vertragspflicht (Kardinalpflicht) und begrenzt auf den vertragstypischen,
          vorhersehbaren Schaden. Eine Haftung für Schäden aus KI-Ausgaben ist im gesetzlich zulässigen
          Rahmen ausgeschlossen.
        </p>
      </LegalSection>

      <LegalSection title="§ 8 Laufzeit und Kündigung">
        <p>
          Soweit nicht anders vereinbart, läuft der Vertrag auf unbestimmte Zeit und kann von beiden Seiten
          mit angemessener Frist gekündigt werden. Das Recht zur außerordentlichen Kündigung aus wichtigem
          Grund bleibt unberührt.
        </p>
      </LegalSection>

      <LegalSection title="§ 9 Widerrufsrecht für Verbraucher">
        <p>
          Verbrauchern steht unter den gesetzlichen Voraussetzungen ein Widerrufsrecht zu. Einzelheiten
          ergeben sich aus der gesondert bereitzustellenden Widerrufsbelehrung. Bei digitalen
          Inhalten/Dienstleistungen kann das Widerrufsrecht vorzeitig erlöschen, wenn die Ausführung mit
          ausdrücklicher Zustimmung begonnen hat.
        </p>
      </LegalSection>

      <LegalSection title="§ 10 Änderungen der AGB">
        <p>
          Der Anbieter kann diese AGB mit Wirkung für die Zukunft ändern. Über Änderungen wird der Nutzer in
          geeigneter Weise informiert.
        </p>
      </LegalSection>

      <LegalSection title="§ 11 Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen unwirksam sein,
          bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
