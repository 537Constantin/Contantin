# iOS / App Store — Schritt-für-Schritt-Anleitung

Dieses Dokument beschreibt, wie aus der Web-App **AI Workforce OS** eine
echte iPhone-App im Apple App Store wird. Die technische Hülle (Capacitor +
native Plugins) ist bereits eingerichtet — du musst nur die Apple-seitigen
Schritte gehen und einmal einen Build erzeugen.

---

## Was bereits drin ist

| Baustein | Datei | Zweck |
| --- | --- | --- |
| Capacitor-Konfiguration | `capacitor.config.ts` | App-ID, App-Name, Server-URL, Plugin-Defaults |
| Statisches Fallback (Offline) | `capacitor-www/index.html` | Wird gezeigt, wenn die Live-URL nicht erreichbar ist |
| Native-Brücke | `src/lib/native.ts` | Splash, StatusBar, Push, Haptics, Secure Storage |
| Bootstrap-Komponente | `src/components/site/native-bridge.tsx` | Wird einmal im Root-Layout gemountet |
| Native Plugins | `package.json` | App, StatusBar, SplashScreen, Push, Haptics, Preferences |
| NPM-Skripte | `package.json` | `ios:add`, `ios:sync`, `ios:open`, `ios:run` |

> **Wichtig:** Auf der Web-Version (Browser, Vercel) sind diese Bausteine
> reine No-ops. Die Web-Funktionalität bleibt unverändert.

---

## Voraussetzungen (einmalig)

1. **Apple Developer Account** — 99 $/Jahr
   - https://developer.apple.com/programs/ → „Enroll"
   - Aktivierung dauert 1–3 Werktage
2. **Mac mit Xcode** *oder* **Cloud-Build-Account** (Empfehlung für Windows/Linux: Expo EAS Build)
   - Xcode: kostenlos im Mac App Store
   - EAS Build: https://expo.dev/eas → ~30 $/Monat (nur während aktiver Builds)
3. **Eindeutige Bundle-ID** im Apple Developer Portal registriert
   - In `capacitor.config.ts` steht `appId: "app.workforceos.ios"`. Passe sie an deine Domain an, z. B. `de.constantin.workforceos`.
4. **App-Symbol** (1024 × 1024 PNG ohne Transparenz, ohne abgerundete Ecken — Apple rundet selbst)
5. **Splash-Screen-Bild** (2732 × 2732, Logo in der Mitte, einfarbiger Hintergrund)
6. **Datenschutzerklärung** als öffentliche URL (z. B. `https://workforce-os.app/datenschutz`) — Pflicht

---

## Konfiguration vorher anpassen

### Bundle-ID setzen

```ts
// capacitor.config.ts
appId: "de.constantin.workforceos",   // <-- DEIN Reverse-Domain-Format
appName: "AI Workforce OS",
```

### Live-URL festlegen

Setze in deinem **Build-Environment** die Variable `CAPACITOR_SERVER_URL`
auf deine Produktions-URL (z. B. die finale Vercel-URL oder deine eigene
Domain). Fällt sie weg, wird die in `capacitor.config.ts` hinterlegte URL
genutzt.

> **Tipp:** Sobald deine eigene Domain (`workforce-os.app`) bei Vercel
> aktiv ist, sollte sie auch in der iOS-App genutzt werden. Apple
> bewertet Apps mit eigener Marken-Domain besser.

---

## Build-Wege

### Variante A — Mit eigenem Mac + Xcode

```bash
# 1. iOS-Plattform einmalig erzeugen (legt einen Xcode-Ordner ./ios an)
npm run ios:add

# 2. Web-Assets in den iOS-Ordner synchronisieren
npm run ios:sync

# 3. Xcode öffnen
npm run ios:open
```

In Xcode:
1. Oben links das Schema **App** wählen, Ziel: dein eigenes iPhone *oder* ein Simulator
2. **Signing & Capabilities** → Team auswählen (dein Apple-Developer-Team)
3. Unter **Capabilities** „Push Notifications" hinzufügen
4. Product → Archive → **Distribute App** → App Store Connect

### Variante B — Cloud-Build via Expo EAS (kein Mac nötig)

```bash
# Einmalige Vorbereitung
npm install -g eas-cli
eas login
eas build:configure
```

`eas.json` (im Repo-Root) ergänzen:

```json
{
  "cli": { "version": ">= 13.0.0" },
  "build": {
    "production": {
      "ios": { "image": "latest" },
      "env": { "CAPACITOR_SERVER_URL": "https://workforce-os.app" }
    }
  }
}
```

Build starten:

```bash
eas build --platform ios --profile production
```

EAS baut auf einer Mac-Instanz in der Cloud, du bekommst nach ~10–20 Min
einen Download-Link für die `.ipa`.

### Variante C — Cloud-Build via Codemagic
Ähnlich wie EAS, etwas mehr UI: https://codemagic.io/start/

---

## App Store Connect — das Listing

1. Auf https://appstoreconnect.apple.com einloggen → „My Apps" → „+"
2. Plattform: **iOS**, Name: **AI Workforce OS**, Sprache: Deutsch
3. Bundle-ID auswählen (die du im Developer Portal angelegt hast)
4. **SKU**: irgendein interner Code, z. B. `workforce-os-v1`

### Was du eingibst

| Feld | Inhalt |
| --- | --- |
| **App-Name** | AI Workforce OS |
| **Untertitel** | Dein KI-Team in der Hosentasche |
| **Beschreibung** | 1–2 Absätze — was die App tut, welche Probleme sie löst |
| **Schlagwörter** | KI, Automation, Sekretär, Buchhaltung, CRM, Workflow |
| **Datenschutz-URL** | https://workforce-os.app/datenschutz |
| **Support-URL** | https://workforce-os.app/support |
| **Marketing-URL** | https://workforce-os.app |
| **Screenshots** | 6,7 Zoll (iPhone Pro Max), 5,5 Zoll, 12,9 Zoll iPad — je 3–6 Stück |
| **App-Icon** | 1024 × 1024 PNG |
| **Altersfreigabe** | 4+ (vermutlich), wird per Fragebogen ermittelt |
| **Preis** | Kostenlos (Abos laufen über deine Website via Stripe) |

### Datenschutz-Deklarationen (Pflichtformular)
- E-Mail-Adresse → Account-Verwaltung
- Name → Account-Verwaltung
- Diagnose / Crash-Daten → App-Optimierung

---

## Apples Guideline 4.2 entschärfen

Apple lehnt Apps ab, die *nur* eine Website wiedergeben. Mit dem
Capacitor-Setup hat die App bereits:

- **Push-Notifications** (native) → APNs-Token bezogen via `registerForPush()`
- **Status-Bar-Steuerung** (native) → wechselt automatisch mit dem Theme
- **Haptisches Feedback** (native) → bei Aktionen
- **Sicherer Speicher** (iOS Keychain) → für Tokens
- **Splash-Screen** (native) → schneller Start

Damit nutzt du Apples Argumentationslinie aktiv — das reicht in der Praxis
fast immer. Falls Apple trotzdem ablehnt:

- Antworte mit dem Hinweis, dass die App native APIs nutzt (Push, Keychain, Haptics)
- Reiche **Anmerkungen für die Prüfung** ein, in denen du das beschreibst

---

## Push-Benachrichtigungen scharfschalten (optional, aber empfohlen)

1. Im Apple Developer Portal → **Keys** → „+" → „Apple Push Notifications service (APNs)"
2. `.p8`-Schlüssel herunterladen — geheim halten
3. In Vercel als ENV-Variable hinterlegen (`APNS_PRIVATE_KEY`, `APNS_KEY_ID`, `APNS_TEAM_ID`)
4. Server-seitig (z. B. `/api/notify/route.ts`, kann ich später bauen) Push-Nachrichten an die in Schritt „registerForPush()" gewonnenen Tokens schicken

---

## Updates nach dem Launch

Wir haben es schon besprochen — hier nochmal als Referenz:

| Änderung | Apple-Review nötig? |
| --- | --- |
| Code-/UI-/Inhaltsänderungen | ❌ Nein, kommt direkt über Vercel |
| Neue Integration (Gmail, Lexoffice…) | ❌ Nein |
| Bug-Fixes | ❌ Nein |
| **Native Capacitor-Plugin aktualisieren** | ✅ Ja, neuer Build + Review |
| **Neue Berechtigungen (Kamera, Mikro…)** | ✅ Ja |
| **App-Icon / App-Name ändern** | ✅ Ja |

→ Geschätzt **>90 % der zukünftigen Änderungen** brauchen kein Apple-Review.

---

## Reihenfolge der Schritte (Kurzfassung)

1. ⏳ Apple-Developer-Account anlegen, Bundle-ID `de.constantin.workforceos` registrieren
2. ⏳ Eigene Domain bei Vercel anbinden (optional, aber empfohlen)
3. ⏳ Icon + Splash + Screenshots vorbereiten
4. ⏳ Datenschutz-Seite veröffentlichen
5. ⏳ Bundle-ID in `capacitor.config.ts` setzen
6. ⏳ `npm run ios:add && npm run ios:sync`
7. ⏳ Xcode öffnen → Signing → Push hinzufügen → Archive
8. ⏳ App Store Connect: Listing ausfüllen
9. ⏳ Build hochladen → Review beantragen
10. ✅ Nach 1–7 Tagen: App ist live im App Store

---

## Wo ich dir helfe

- ✅ **Code-Seite ist erledigt**: Capacitor + Plugins + Native-Bridge + Layout-Integration sind eingebaut.
- 🟡 **Bundle-ID anpassen** kann ich, sobald du dich entschieden hast.
- 🟡 **App-Icon / Splash-Screen** kann ich aus einer Vorlage generieren (z. B. mit `npx @capacitor/assets`).
- 🟡 **Push-Notification-Backend (`/api/notify`)** kann ich später bauen, sobald APNs-Keys da sind.
- ✅ **Code-Updates** funktionieren weiter wie heute — Vercel-Deploy = Live in iOS-App.

**Was du selbst tun musst (kann ich nicht):**
- Apple-Developer-Account-Anmeldung
- App-Listing-Texte und Screenshots
- Build-Signierung (Mac/EAS) und Upload
- Apple-Review-Antworten

Sag Bescheid, wenn du beim Listing oder beim Bundle-ID-Setzen Hilfe brauchst.
