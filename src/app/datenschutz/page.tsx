import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/legal-shell";
import { legal } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Datenschutzerklärung · ${siteConfig.name}`,
  description: "Informationen zur Verarbeitung personenbezogener Daten nach DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutzerklärung" updated={legal.lastUpdated}>
      <LegalSection title="1. Verantwortlicher">
        <p>Verantwortlich für die Datenverarbeitung in dieser Anwendung ist:</p>
        <p>
          {legal.companyName}
          <br />
          {legal.street}
          <br />
          {legal.postalCode} {legal.city}
          <br />
          E-Mail: {legal.email}
        </p>
      </LegalSection>

      <LegalSection title="2. Grundlegendes">
        <p>
          Wir verarbeiten personenbezogene Daten nur im Rahmen der gesetzlichen Bestimmungen (DSGVO, BDSG).
          Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), lit. f
          (berechtigtes Interesse), lit. a (Einwilligung) und lit. c (rechtliche Verpflichtung).
        </p>
      </LegalSection>

      <LegalSection title="3. Hosting">
        <p>
          Diese Anwendung wird bei der Vercel Inc. (USA) gehostet. Beim Aufruf werden technisch notwendige
          Daten (z. B. IP-Adresse, Zeitpunkt, abgerufene Ressource, Browsertyp) verarbeitet, um Auslieferung
          und Sicherheit zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Mit dem Anbieter ist ein
          Auftragsverarbeitungsvertrag abzuschließen; die Datenübermittlung in die USA wird auf
          Standardvertragsklauseln gestützt.
        </p>
      </LegalSection>

      <LegalSection title="4. Server-Logfiles">
        <p>
          Der Hosting-Anbieter erhebt und speichert automatisch Informationen in Server-Logfiles, die dein
          Browser übermittelt. Diese Daten sind nicht bestimmten Personen zuordenbar und werden nicht mit
          anderen Datenquellen zusammengeführt.
        </p>
      </LegalSection>

      <LegalSection title="5. Lokale Speicherung (localStorage)">
        <p>
          Zur Bereitstellung der Funktionen speichert die Anwendung Daten lokal in deinem Browser (z. B.
          erstellte Workflows, Dokumente, Spezialisierungen und Einstellungen). Diese verbleiben auf deinem
          Gerät, bis du sie löschst. Eine Übertragung an uns findet nur statt, soweit eine Datenbank- bzw.
          Kontofunktion aktiv ist (siehe unten).
        </p>
      </LegalSection>

      <LegalSection title="6. Nutzerkonto & Anmeldung (Clerk)">
        <p>
          Für Registrierung und Login nutzen wir – sofern aktiviert – den Dienst Clerk (Clerk, Inc., USA).
          Dabei werden die zur Anmeldung erforderlichen Daten (z. B. E-Mail-Adresse, Name, Login-Metadaten)
          verarbeitet (Art. 6 Abs. 1 lit. b DSGVO). Die Übermittlung in die USA wird auf
          Standardvertragsklauseln gestützt.
        </p>
      </LegalSection>

      <LegalSection title="7. KI-Verarbeitung (OpenAI)">
        <p>
          Wenn du mit den KI-Assistenten chattest, Workflows ausführst oder Inhalte (auch hochgeladene
          Dateien) zur Verarbeitung übergibst, werden diese Eingaben zur Erzeugung der Antworten an OpenAI
          (OpenAI, L.L.C., USA) übermittelt und dort verarbeitet (Art. 6 Abs. 1 lit. b und lit. f DSGVO).{" "}
          <strong>
            Bitte gib keine besonderen Kategorien personenbezogener Daten oder vertraulichen Informationen
            Dritter ein
          </strong>
          , soweit dies nicht erforderlich ist und keine Rechtsgrundlage dafür besteht. Die Übermittlung in
          die USA wird auf Standardvertragsklauseln gestützt; mit OpenAI ist ein
          Auftragsverarbeitungsvertrag abzuschließen.
        </p>
      </LegalSection>

      <LegalSection title="8. Datenbank">
        <p>
          Sofern eine Datenbank konfiguriert ist, speichern wir deine in der Anwendung erstellten Inhalte
          dauerhaft, um sie kontobezogen und geräteübergreifend bereitzustellen (Art. 6 Abs. 1 lit. b DSGVO).
        </p>
      </LegalSection>

      <LegalSection title="9. Zahlungsabwicklung (Stripe)">
        <p>
          Für kostenpflichtige Leistungen nutzen wir – sobald aktiviert – den Zahlungsdienstleister Stripe.
          Die Zahlungsdaten werden direkt von Stripe verarbeitet; wir erhalten keine vollständigen
          Zahlungsmitteldaten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </LegalSection>

      <LegalSection title="10. E-Mail-Versand">
        <p>
          Für den Versand von Benachrichtigungen (z. B. aus Workflows) setzen wir – sofern aktiviert – einen
          E-Mail-Dienstleister ein. Verarbeitet werden die dafür nötigen Empfänger- und Inhaltsdaten.
        </p>
      </LegalSection>

      <LegalSection title="11. Deine Rechte">
        <p>Dir stehen hinsichtlich deiner personenbezogenen Daten folgende Rechte zu:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p>
          Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
          deiner personenbezogenen Daten zu beschweren (Art. 77 DSGVO).
        </p>
      </LegalSection>

      <LegalSection title="12. Speicherdauer">
        <p>
          Wir verarbeiten und speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck
          erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen. Danach werden die Daten
          gelöscht.
        </p>
      </LegalSection>

      <LegalSection title="13. Änderungen">
        <p>
          Wir passen diese Datenschutzerklärung an, sobald Änderungen der Dienste oder der Rechtslage dies
          erforderlich machen. Es gilt die jeweils aktuelle, hier veröffentlichte Fassung.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
