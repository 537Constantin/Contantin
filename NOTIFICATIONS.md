# 🔔 Push-Benachrichtigungen (Termin-Erinnerungen)

Echte Web-Push-Erinnerungen, die auch feuern, wenn die App **geschlossen** ist.
Alles kostenlos (VAPID-Keys + Web-Push kosten nichts).

## So funktioniert es
1. Nutzer aktiviert im **Kalender** oben „Erinnerungen aktivieren" → Browser fragt
   nach Erlaubnis, die Subscription wird in der Datenbank gespeichert (pro Gerät).
2. Ein **Cron** (`/api/notifications/cron`) prüft alle paar Minuten, welche Termine
   in den nächsten **15 Minuten** starten, und schickt dafür eine Push-Nachricht.
3. Der Service Worker (`public/sw.js`) zeigt die Benachrichtigung an.

## Einmalige Einrichtung (du)

### 1. Env-Variablen in Vercel setzen
Projekt → **Settings → Environment Variables** → für Production hinzufügen:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BC2GLeecp_4UnLN5yqg51G7UvTomnQ-3XU9mJ7debdvZif1Rdiv_f9H8gv3y7mRDqupbilmfUMLIG3crVciJbM0
VAPID_PRIVATE_KEY            = a8qOnuPLVW1kkQuhMObdVUO5n4tbSalPRtg9p7LW-Qs
CRON_SECRET                  = <ein-langes-zufaelliges-Passwort>
```

- Der **PRIVATE** Key bleibt geheim (nur hier, nie ins Frontend).
- `CRON_SECRET` gibt es evtl. schon (für die Workflow-Crons). Falls ja, nimm den
  vorhandenen Wert. Falls nein, erfinde ein langes zufälliges.
- Nach dem Setzen einmal **neu deployen** (Vercel → Deployments → Redeploy).

### 2. Minuten-Cron einrichten (kostenlos, extern)
Vercels Gratis-Plan lässt eigene Crons nur 1×/Tag laufen – für „15 Min vorher"
brauchen wir alle paar Minuten. Am einfachsten mit **cron-job.org** (gratis):

1. Auf <https://cron-job.org> registrieren.
2. Neuen Cronjob anlegen:
   - **URL:** `https://contantin-aywb.vercel.app/api/notifications/cron?secret=DEIN_CRON_SECRET`
   - **Zeitplan:** alle **5 Minuten** (`*/5 * * * *`).
3. Speichern. Fertig – der prüft jetzt laufend deine Termine.

(Test: die URL einmal im Browser öffnen → sollte `{"ok":true,"sent":0}` zeigen.)

### 3. Auf dem iPhone
Web-Push funktioniert auf iOS **nur als Home-Screen-App** (iOS 16.4+):
1. Seite in **Safari** öffnen → Teilen → **„Zum Home-Bildschirm"**.
2. Die App vom Home-Bildschirm öffnen (nicht im normalen Safari-Tab).
3. Im Kalender **„Erinnerungen aktivieren"** und die Nachfrage erlauben.

Auf Android/Desktop reicht der normale Browser.

## Testen
1. Trage einen Termin **~10 Minuten in der Zukunft** mit Uhrzeit ein.
2. Warte bis der Cron läuft (max. 5 Min) → die Benachrichtigung sollte kommen.

## Konfiguration im Code
- Vorlaufzeit: `LEAD_MIN` in `src/app/api/notifications/cron/route.ts` (Standard 15).
- Der Cron sendet pro Termin **einmal** (Dedupe über `push_sent`-Einträge).
