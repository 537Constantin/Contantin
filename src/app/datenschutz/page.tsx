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
        <p>
          <strong>Hinweis:</strong> KI-generierte Ergebnisse können unrichtig oder unvollständig sein und
          stellen keine rechtliche, steuerliche, medizinische oder sonstige fachliche Beratung dar. Bitte
          prüfe Ergebnisse vor einer Verwendung eigenverantwortlich (siehe auch unsere AGB).
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

      <LegalSection title="11. Cookies & lokale Speicherung, Einwilligung">
        <p>
          Wir verwenden technisch notwendige Speicherung (z. B. Cookies bzw. localStorage), damit die
          Anwendung funktioniert – etwa für Anmeldung, Sitzung und deine Einstellungen. Diese ist für den
          Betrieb erforderlich (Art. 6 Abs. 1 lit. f DSGVO bzw. § 25 Abs. 2 TDDDG). Optionale Cookies oder
          Analyse-/Tracking-Technologien setzen wir nur mit deiner ausdrücklichen Einwilligung ein
          (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG), die du über das Einwilligungs-Banner erteilst und
          jederzeit für die Zukunft widerrufen kannst.
        </p>
      </LegalSection>

      <LegalSection title="12. Postfach-Anbindung (IMAP/SMTP)">
        <p>
          Wenn du dein E-Mail-Postfach verbindest, verarbeiten wir die von dir angegebenen Zugangsdaten sowie
          die abgerufenen E-Mail-Inhalte, um den Posteingang darzustellen, Nachrichten zu analysieren und
          Antworten in deinem Auftrag zu versenden (Art. 6 Abs. 1 lit. b DSGVO). Zugangsdaten werden
          <strong> verschlüsselt gespeichert</strong> und ausschließlich serverseitig zum Verbindungsaufbau
          entschlüsselt; sie werden nicht an den Browser übertragen. E-Mail-Inhalte, die du zur KI-Analyse
          übergibst, werden gemäß Ziffer 7 verarbeitet. Du kannst die Verbindung jederzeit trennen, wodurch
          die gespeicherten Zugangsdaten gelöscht werden.
        </p>
      </LegalSection>

      <LegalSection title="13. Anmeldung am Postfach über OAuth (Google/Microsoft)">
        <p>
          Alternativ kannst du dein Postfach per OAuth von Google (Google Ireland Ltd./Google LLC) oder
          Microsoft (Microsoft Ireland Operations Ltd.) verbinden. Dabei erhalten wir ein Zugriffs- bzw.
          Aktualisierungs-Token für den E-Mail-Zugriff; dein Passwort erhalten wir nicht. Das
          Aktualisierungs-Token wird verschlüsselt gespeichert, Zugriffstokens werden bei Bedarf neu
          angefordert und nicht dauerhaft gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Du
          kannst den Zugriff jederzeit in deinem Google-/Microsoft-Konto und durch Trennen der Verbindung
          widerrufen.
        </p>
      </LegalSection>

      <LegalSection title="14. Push-Benachrichtigungen">
        <p>
          Sofern du Push-Benachrichtigungen aktivierst, speichern wir die dafür nötigen Abo-Daten deines
          Browsers/Geräts (Push-Endpoint und Schlüssel), um dich z. B. an Termine zu erinnern
          (Art. 6 Abs. 1 lit. a DSGVO). Du kannst die Benachrichtigungen jederzeit in der App oder in den
          Browser-/Systemeinstellungen wieder deaktivieren.
        </p>
      </LegalSection>

      <LegalSection title="15. Deine Rechte">
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

      <LegalSection title="16. Speicherdauer">
        <p>
          Wir verarbeiten und speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck
          erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen. Danach werden die Daten
          gelöscht.
        </p>
      </LegalSection>

      <LegalSection title="17. Änderungen">
        <p>
          Wir passen diese Datenschutzerklärung an, sobald Änderungen der Dienste oder der Rechtslage dies
          erforderlich machen. Es gilt die jeweils aktuelle, hier veröffentlichte Fassung.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
