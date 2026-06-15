import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/legal-shell";
import { legal } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Datenschutzerklärung · ${siteConfig.name}`,
  description: `Wie ${siteConfig.name} personenbezogene Daten verarbeitet (DSGVO) – konkret für diese Anwendung.`,
};

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutzerklärung" updated={legal.lastUpdated}>
      <LegalSection title="1. Verantwortlicher">
        <p>
          Verantwortlich für die Verarbeitung personenbezogener Daten im Rahmen der Anwendung{" "}
          {siteConfig.name} (nachfolgend „App“) ist:
        </p>
        <p>
          {legal.companyName}
          <br />
          {legal.street}
          <br />
          {legal.postalCode} {legal.city}, {legal.country}
          <br />
          E-Mail: {legal.email}
        </p>
        <p>Bei Fragen zum Datenschutz erreichst du uns jederzeit unter der oben genannten E-Mail-Adresse.</p>
      </LegalSection>

      <LegalSection title="2. Überblick: Was diese App verarbeitet">
        <p>
          {siteConfig.name} ist eine Anwendung für KI-gestützte Assistenten und Automatisierung (Chat,
          Workflows, Dokumenten-Analyse, Spezialisierungen, Diagramme, ein Telefon-Assistent als Testumgebung
          sowie Team- und Mitarbeiterverwaltung). Je nachdem, welche Funktionen du nutzt, verarbeiten wir:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>technische Zugriffsdaten beim Aufruf der App (durch unseren Hoster),</li>
          <li>von dir eingegebene Inhalte (Chat-Nachrichten, Workflow-Eingaben, Diagramm- und Wissensdaten),</li>
          <li>den Textinhalt von Dateien, die du hochlädst,</li>
          <li>von dir angelegte Objekte (eigene KI-Mitarbeiter, Workflows, Spezialisierungen, Anrufnotizen),</li>
          <li>Kontaktdaten, die du selbst einträgst (z. B. Name/E-Mail bei Team-Einladungen oder für den E-Mail-Versand eines Ergebnisses),</li>
          <li>sofern aktiviert: Konto- und Anmeldedaten sowie Zahlungsdaten.</li>
        </ul>
        <p>
          Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Nutzung der App), lit. f
          (berechtigtes Interesse an Betrieb und Sicherheit), lit. a (Einwilligung) und lit. c (rechtliche
          Verpflichtung).
        </p>
      </LegalSection>

      <LegalSection title="3. Speicherort deiner Inhalte (lokal oder Datenbank)">
        <p>
          Die in der App erstellten Inhalte – z. B. Workflows, hochgeladene Dokumente, Diagramme,
          Spezialisierungen samt eigenem Fachwissen, selbst erstellte KI-Mitarbeiter, Anrufnotizen und
          Team-Einladungen – werden standardmäßig <strong>ausschließlich lokal in deinem Browser</strong>{" "}
          (localStorage) gespeichert und verlassen dein Gerät nicht.
        </p>
        <p>
          Nur wenn eine Datenbank konfiguriert ist, speichern wir diese Inhalte zusätzlich dauerhaft auf
          unserem Server, um sie kontobezogen und geräteübergreifend bereitzustellen (Art. 6 Abs. 1 lit. b
          DSGVO). Ist zugleich die Anmeldung (siehe Ziffer 8) aktiv, sind die Inhalte je Konto getrennt; ohne
          Anmeldung erfolgt die Speicherung in einem gemeinsamen Demo-Bereich.
        </p>
      </LegalSection>

      <LegalSection title="4. KI-Verarbeitung (OpenAI)">
        <p>
          Für die Erzeugung von Antworten und Ergebnissen nutzt die App Modelle von OpenAI (OpenAI, L.L.C.,
          USA). Wenn du mit einem KI-Mitarbeiter chattest, einen Workflow ausführst, ein Diagramm auswerten
          lässt, den Telefon-Assistenten testest oder eine Datei zur Zusammenfassung übergibst, werden die
          dafür nötigen Eingaben (deine Nachricht, der relevante Textinhalt sowie das hinterlegte Fachwissen)
          an OpenAI übermittelt und dort zur Erstellung der Ausgabe verarbeitet (Art. 6 Abs. 1 lit. b und
          lit. f DSGVO).
        </p>
        <p>
          <strong>
            Bitte gib keine besonderen Kategorien personenbezogener Daten (Art. 9 DSGVO) und keine
            vertraulichen Informationen Dritter ein, soweit dies nicht erforderlich ist und keine
            Rechtsgrundlage dafür besteht.
          </strong>{" "}
          Die Übermittlung in die USA wird auf Standardvertragsklauseln der EU-Kommission gestützt.
        </p>
        <p>
          Chat-Verläufe werden für die Beantwortung verarbeitet, von uns jedoch nicht dauerhaft als
          Gesprächsprotokoll auf unseren Servern gespeichert; sie verbleiben in deiner Browsersitzung.
        </p>
      </LegalSection>

      <LegalSection title="5. Hochgeladene Dateien (Dokumente)">
        <p>
          Lädst du eine Datei hoch (z. B. PDF, Word, Text), wird daraus der <strong>Textinhalt extrahiert</strong>
          – bei gängigen Formaten bereits in deinem Browser. Gespeichert werden anschließend der Dateiname,
          die Dateigröße und der extrahierte Text (gemäß Ziffer 3 lokal bzw. in der Datenbank). Die
          Original-Binärdatei wird nicht dauerhaft auf unseren Servern abgelegt.
        </p>
        <p>
          Der extrahierte Text wird erst dann an OpenAI übermittelt, wenn du dazu eine Aktion auslöst (z. B.
          „Mit KI zusammenfassen“). Bitte lade nur Dateien hoch, an denen du die erforderlichen Rechte hast.
        </p>
      </LegalSection>

      <LegalSection title="6. Telefon-Assistent (derzeit Simulator)">
        <p>
          Der Telefon-Bereich ist aktuell eine <strong>textbasierte Testumgebung</strong>: Du spielst ein
          Gespräch im Browser durch, um Begrüßung, Regeln und vorgegebene Antworten zu prüfen. Es werden
          <strong> keine echten Anrufe entgegengenommen oder getätigt und keine Sprach-/Audioaufnahmen
          verarbeitet.</strong> Die simulierten Gesprächstexte werden wie ein normaler Chat an OpenAI
          übermittelt (siehe Ziffer 4). Manuell von dir erfasste Anrufnotizen (z. B. Name, Dauer,
          Zusammenfassung) werden wie deine übrigen Inhalte gespeichert (siehe Ziffer 3).
        </p>
      </LegalSection>

      <LegalSection title="7. Hosting & Server-Logfiles (Vercel)">
        <p>
          Die App wird bei der Vercel Inc. (USA) gehostet. Beim Aufruf verarbeitet der Hoster technisch
          notwendige Daten (z. B. IP-Adresse, Datum/Uhrzeit, abgerufene Ressource, Browsertyp), um die
          Auslieferung und die Sicherheit der App zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Diese
          Server-Logfiles sind für uns nicht ohne Weiteres bestimmten Personen zuordenbar. Die Übermittlung in
          die USA wird auf Standardvertragsklauseln gestützt.
        </p>
      </LegalSection>

      <LegalSection title="8. Nutzerkonto & Anmeldung (Clerk, sofern aktiviert)">
        <p>
          Für Registrierung und Login setzen wir – sofern aktiviert – den Dienst Clerk (Clerk, Inc., USA) ein.
          Dabei werden die zur Anmeldung erforderlichen Daten (z. B. E-Mail-Adresse, Name, Login-Metadaten)
          verarbeitet (Art. 6 Abs. 1 lit. b DSGVO). Ist die Anmeldung nicht aktiviert, ist für die Nutzung der
          App keine Kontoerstellung erforderlich. Die Übermittlung in die USA wird auf Standardvertragsklauseln
          gestützt.
        </p>
      </LegalSection>

      <LegalSection title="9. Team-Einladungen">
        <p>
          Wenn du ein Teammitglied einlädst, verarbeiten und speichern wir die von dir eingegebenen Daten
          (Name, E-Mail-Adresse, Rolle), um die Mitgliederliste deines Workspace zu führen (Art. 6 Abs. 1
          lit. f DSGVO). Du bist dafür verantwortlich, dass du die eingetragenen Personen einladen darfst.
        </p>
      </LegalSection>

      <LegalSection title="10. E-Mail-Versand von Ergebnissen (sofern aktiviert)">
        <p>
          Optional kannst du dir das Ergebnis eines Workflows per E-Mail zusenden lassen. Ist diese Funktion
          aktiviert, wird dafür ein E-Mail-Dienstleister eingesetzt; verarbeitet werden die von dir angegebene
          Empfängeradresse und der Ergebnisinhalt (Art. 6 Abs. 1 lit. b DSGVO).
        </p>
      </LegalSection>

      <LegalSection title="11. Zahlungsabwicklung (Stripe, sofern aktiviert)">
        <p>
          Für kostenpflichtige Leistungen nutzen wir – sobald aktiviert – den Zahlungsdienstleister Stripe.
          Die Zahlungsdaten werden direkt von Stripe verarbeitet; wir erhalten keine vollständigen
          Zahlungsmitteldaten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. In einer Demo-/Testphase findet
          keine echte Zahlung statt.
        </p>
      </LegalSection>

      <LegalSection title="12. Cookies & Tracking">
        <p>
          Die App nutzt zur Bereitstellung ihrer Funktionen technisch notwendigen lokalen Speicher
          (localStorage), z. B. für deine Inhalte und Einstellungen.{" "}
          <strong>Wir setzen keine Tracking- oder Werbe-Cookies und keine Analyse-/Tracking-Dienste ein.</strong>{" "}
          Es findet kein nutzerbezogenes Profiling zu Werbezwecken statt.
        </p>
      </LegalSection>

      <LegalSection title="13. Auftragsverarbeitung & Drittland">
        <p>
          Soweit die genannten Dienstleister (insbesondere OpenAI, Vercel, Clerk, Stripe sowie ein
          E-Mail-Dienstleister) personenbezogene Daten in unserem Auftrag verarbeiten, erfolgt dies auf
          Grundlage von Auftragsverarbeitungsverträgen gemäß Art. 28 DSGVO. Übermittlungen in Drittländer (z. B.
          USA) werden auf geeignete Garantien, insbesondere Standardvertragsklauseln der EU-Kommission,
          gestützt.
        </p>
      </LegalSection>

      <LegalSection title="14. Speicherdauer">
        <p>
          Lokal gespeicherte Inhalte verbleiben in deinem Browser, bis du sie löschst (in der App oder über
          die Browsereinstellungen). In der Datenbank gespeicherte Inhalte werden gespeichert, solange dein
          Konto bzw. die Nutzung besteht oder bis du sie löschst. Im Übrigen verarbeiten wir personenbezogene
          Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche
          Aufbewahrungsfristen dies vorsehen.
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
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p>
          Zur Ausübung genügt eine formlose Nachricht an {legal.email}. Außerdem hast du das Recht, dich bei
          einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).
        </p>
      </LegalSection>

      <LegalSection title="16. Änderungen dieser Erklärung">
        <p>
          Wir passen diese Datenschutzerklärung an, sobald Änderungen der App, der eingesetzten Dienste oder
          der Rechtslage dies erforderlich machen. Es gilt die jeweils aktuelle, hier veröffentlichte Fassung
          (Stand: {legal.lastUpdated}).
        </p>
      </LegalSection>
    </LegalShell>
  );
}
