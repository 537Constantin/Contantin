# 📱 Native App bauen (iOS & Android) mit Capacitor

Diese App ist als **Capacitor-Wrapper** vorbereitet. Der native Container lädt die
**live deployte Web-App** (`contantin-aywb.vercel.app`) und legt native Funktionen
darüber: echtes Haptik-Feedback, native Status-Bar, Splash-Screen, Android-Back-Button.

> **Warum kein „Offline-Bündel"?** Die App ist server-gerendert (API-Routen, Login,
> dynamische Daten) und lässt sich nicht statisch exportieren. Deshalb lädt der
> Wrapper die Live-URL. Die App braucht also Internet — als SaaS ohnehin der Fall.

---

## Was du brauchst

| Für … | Brauchst du |
|---|---|
| **iOS-Build / Simulator** | einen **Mac** mit **Xcode** (gratis im App Store) |
| **iPhone-Test (eigenes Gerät)** | Mac + Xcode + **kostenlose Apple-ID** |
| **App Store / TestFlight** | **Apple Developer Program – 99 $/Jahr** |
| **Android-Build** | **Android Studio** (gratis, läuft auch auf Windows/Linux/Mac) |
| **Google Play** | Play Console – **25 $ einmalig** |

> ⚠️ Den iOS-Teil kann **nur ein Mac**. Android geht auf jedem Betriebssystem.

---

## Einmalige Einrichtung (auf dem Mac)

```bash
# 1. Repo holen & Abhängigkeiten installieren
git clone <dein-repo>
cd Contantin
npm install

# 2. Native Projekte erzeugen (legt ios/ und android/ an)
npx cap add ios
npx cap add android

# 3. Web-Assets + Plugins in die nativen Projekte kopieren
npx cap sync
```

`npx cap add ios` installiert auch die CocoaPods-Abhängigkeiten. Falls `pod` fehlt:
`sudo gem install cocoapods`.

---

## iOS öffnen & starten

```bash
npm run cap:ios       # öffnet das Projekt in Xcode
```

In Xcode:
1. Oben links das Schema **App** wählen, daneben ein Gerät (z. B. „iPhone 15 Simulator").
2. **▶︎ Run** drücken. Die App startet und lädt die Live-Seite.
3. **Auf dein eigenes iPhone:** iPhone per Kabel anschließen, in Xcode als Ziel
   wählen → unter *Signing & Capabilities* dein (kostenloses) Apple-ID-Team
   auswählen → Run. (Free-Provisioning hält 7 Tage, danach neu deployen.)

---

## Android öffnen & starten

```bash
npm run cap:android   # öffnet das Projekt in Android Studio
```

In Android Studio einen Emulator oder ein angeschlossenes Gerät wählen → **Run ▶︎**.

---

## App-Icon & Splash-Screen

Icon und Splash sind **schon erzeugt**. Die Quell-Assets liegen unter
`assets/icon.png` (1024×1024) und `assets/splash.png` (2732×2732). Daraus
generierst du alle nativen Größen mit dem offiziellen Generator:

```bash
npm i -D @capacitor/assets
npx @capacitor/assets generate --ios --android
```

Willst du das Logo ändern: das Design lebt in `scripts/generate-app-icons.mjs`
(reines SVG, kein Designtool nötig). Nach Anpassung neu erzeugen mit:

```bash
npm run icons
```

Das aktualisiert in einem Rutsch die Web-Icons (Favicon, iOS-Home-Icon,
PWA-Manifest, iOS-Splash) **und** die Capacitor-Quell-Assets.

---

## In den App Store (Kurzfassung)

1. **Apple Developer Program** beitreten (99 $/Jahr): <https://developer.apple.com/programs/>
2. In Xcode unter *Signing & Capabilities* dein bezahltes Team wählen.
3. **Product → Archive** → **Distribute App** → **App Store Connect**.
4. In **App Store Connect** (appstoreconnect.apple.com) den App-Eintrag anlegen
   (Name, Screenshots, Datenschutz, Beschreibung) und zur Prüfung einreichen.
5. Review dauert i. d. R. 1–3 Tage.

> Apple verlangt bei reinen „Website-Wrappern" oft Mehrwert durch native Features.
> Status-Bar, Haptik, Splash und Push (optional) helfen hier — echte native
> Integration ist eingebaut bzw. vorbereitet.

---

## Updates ausspielen

Weil der Wrapper die Live-URL lädt, erscheinen **Web-Änderungen sofort** in der App
(nach dem nächsten Vercel-Deploy) — **ohne** neuen App-Store-Build. Einen neuen
nativen Build brauchst du nur, wenn sich **native** Dinge ändern (Icon, Plugins,
Capacitor-Version, iOS-Berechtigungen).

---

## Konfiguration im Code

- `capacitor.config.ts` — App-ID (`com.contantin.workforce`), Name, `server.url`, Splash.
- `src/lib/native.ts` — native Initialisierung (Status-Bar, Splash, Back-Button).
- `src/lib/haptics.ts` — echtes Haptik nativ, Vibration im Web.
- `src/components/app/native-init.tsx` — startet die native Init beim App-Start.

Die App-ID `com.contantin.workforce` kannst du vor dem ersten Build noch in
`capacitor.config.ts` ändern (muss zu deiner Apple-Bundle-ID passen).
