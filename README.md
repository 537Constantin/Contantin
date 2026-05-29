# AI Workforce OS

> Das Betriebssystem für KI-Mitarbeiter. Erstelle autonome KI-Agenten, die
> Telefon, Termine, E-Mails, Support, Dokumente und Beratung übernehmen –
> wie ein echtes digitales Team, rund um die Uhr.

Eine moderne, dunkle, Glassmorphism-SaaS-Oberfläche im Stil von Linear / Stripe /
OpenAI, gebaut mit **Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
und Framer Motion**. Streaming-Chat über eine OpenAI-kompatible API mit
vollständigem Demo-Fallback (läuft sofort, ganz ohne Schlüssel).

---

## ✨ Funktionen

| Bereich | Beschreibung |
| --- | --- |
| **Landingpage** | Konversionsstarke Marketing-Seite mit Hero, Features, Agenten, Preisen |
| **Dashboard** | Live-Status der Agenten, KPIs, Aktivitätsfeed, Charts, Prioritäten |
| **KI-Mitarbeiter** | Liste, Filter, Detailprofile + geführter 3-Schritt-Erstellungs-Dialog |
| **Chat** | Streaming-Antworten, Agentenwechsel, Markdown, Vorschläge, Stop-Button |
| **Telefon** | Gesprächsprotokolle, Live-Transkription, Stimmung, intelligentes Routing |
| **Dokumente** | Upload-Dropzone, KI-Zusammenfassungen, Tags, semantische Suche, Kategorien |
| **Workflows** | Visuelle Automationen mit Triggern, Bedingungen und KI-Schritten |
| **Analytics & Beratung** | KPIs, Umsatz-/Auslastungs-Charts, KI-Handlungsempfehlungen |
| **Team** | Mitglieder, Rollen, Berechtigungen, Audit-Log |
| **Einstellungen** | Workspace, KI-Modelle, Stripe-Abrechnung, Benachrichtigungen, Sicherheit |

Vollständig responsiv (mobiler Sidebar-Drawer), Hell-/Dunkelmodus, `prefers-reduced-motion`,
Tastatur-Fokus, Custom-Scrollbars und durchgehende Micro-Interactions.

---

## 🚀 Schnellstart

```bash
npm install
npm run dev
# http://localhost:3000  → Landingpage
# http://localhost:3000/dashboard → App
```

Das war's. Der Chat läuft im **Demo-Modus** und streamt kontextbezogene Antworten,
auch ohne API-Schlüssel.

### Live-KI aktivieren

```bash
cp .env.example .env
# OPENAI_API_KEY=sk-... eintragen
```

Mit gesetztem `OPENAI_API_KEY` ruft `/api/chat` das echte Modell mit
agentenspezifischem System-Prompt auf und streamt die Tokens. Antwortet die API
mit `X-Workforce-Mode: live` (statt `demo`), ist der Live-Modus aktiv.

### Zahlungen aktivieren (Stripe)

Die Abo-Plans (`Starter`, `Growth`, `Enterprise`) sind zentral in
`src/lib/billing.ts` definiert und werden von Landingpage, Einstellungen und
Checkout gemeinsam genutzt. **Ohne Schlüssel** läuft der Checkout im Demo-Modus:
Ein Klick auf einen Plan führt zur Erfolgsseite, ohne dass etwas berechnet wird.

Für echte Zahlungen (kostenloser Test-Modus bei Stripe):

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_STARTER=price_...   # wiederkehrender Monatspreis
STRIPE_PRICE_GROWTH=price_...
STRIPE_WEBHOOK_SECRET=whsec_...  # optional, prüft /api/billing/webhook
```

`/api/billing/checkout` erstellt dann eine echte Stripe-Checkout-Session
(per REST, ohne SDK), `/api/billing/webhook` verifiziert eingehende Events.
Die Persistenz der Abos erfolgt, sobald die Datenbank (Prisma) angebunden ist.

---

## 🧱 Architektur

```
src/
├─ app/
│  ├─ layout.tsx              Root: Fonts, Theme-Provider (Dark-Default)
│  ├─ page.tsx                Marketing-Landingpage
│  ├─ globals.css             Design-Tokens (Tailwind v4 @theme), Utilities
│  ├─ (app)/                  Route-Group mit App-Shell (Sidebar + Topbar)
│  │  ├─ dashboard/ employees/ chat/ workflows/
│  │  ├─ documents/ calls/ analytics/ team/ settings/
│  └─ api/chat/route.ts       Edge-Streaming-API (OpenAI + Mock-Fallback)
├─ components/
│  ├─ ui/                     Primitive: Button, Badge, Card, Avatar, Progress
│  ├─ app/                    Shell, Charts (SVG), KPI-, Activity-, Status-Bausteine
│  ├─ marketing/              Nav & Footer der Landingpage
│  ├─ motion/                 Reveal / Stagger (Framer Motion)
│  └─ site/                   Theme-Provider & -Toggle
└─ lib/
   ├─ types.ts                Domänen-Typen (spiegeln das Prisma-Schema)
   ├─ nav.ts                  Navigationskonfiguration
   ├─ utils.ts                cn(), Formatter
   └─ data/                   Typisierte Seed-Datenschicht (austauschbar gegen DB)
prisma/schema.prisma          PostgreSQL-Datenmodell für die Persistenz
```

**Designprinzipien:** Clean Architecture mit klarer Trennung von UI-Primitiven,
Feature-Komponenten und Datenschicht. Die `lib/data/*`-Module sind 1:1 gegen
Prisma-Queries austauschbar – die UI hängt nur von den Typen in `lib/types.ts`.

---

## 🗄️ Datenbank (optional)

Workflows, Dokumente und Diagramme werden **standardmäßig im Browser**
(localStorage) gespeichert – die App läuft also ganz ohne Datenbank. Sobald eine
`DATABASE_URL` gesetzt ist, schaltet die App automatisch auf **dauerhafte,
geräteübergreifende** Speicherung in PostgreSQL um (via Prisma). Ist die DB nicht
erreichbar, fällt die App nahtlos wieder auf localStorage zurück.

**Aktivieren (kostenlos):**

1. Datenbank anlegen – z. B. **Vercel Postgres** (Vercel → Storage → Create) oder
   **Neon** ([neon.tech](https://neon.tech)).
2. Die Postgres-/Prisma-Verbindungs-URL als `DATABASE_URL` in Vercel
   (Project → Settings → Environment Variables) bzw. in `.env` setzen.
3. Neu deployen. Das Schema wird beim Build **automatisch** angewendet
   (`prisma db push`), es ist kein manueller Schritt nötig.

Der Verbindungsstatus ist unter **Einstellungen → Allgemein → „Datenbank &
Speicher"** sichtbar. Lokal:

```bash
npm run db:push       # Schema manuell in die DB schreiben
npm run db:studio     # Daten im Browser inspizieren
```

Persistiert wird über das generische `StoreItem`-Modell (`prisma/schema.prisma`)
und die Route `/api/store`; der Client nutzt `src/lib/store-sync.ts`.

---

## ⚙️ Tech-Stack

- **Frontend:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · lucide-react
- **Backend:** Next.js Route Handlers (Edge Runtime) · Prisma + PostgreSQL (vorbereitet)
- **AI:** OpenAI-kompatibles Streaming · agentenspezifische System-Prompts · Multi-Agent-Modell
- **Integrationen (vorbereitet via ENV):** Auth.js/Clerk · Stripe · Twilio/ElevenLabs (Voice)

---

## 📦 Deployment

### Vercel (empfohlen)

1. Repository importieren.
2. Environment-Variablen aus `.env.example` setzen (mindestens `OPENAI_API_KEY` für Live-KI).
3. Deploy – Next.js wird automatisch erkannt.

### Docker

```bash
docker build -t ai-workforce-os .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... ai-workforce-os
```

Das `Dockerfile` nutzt Next.js `output: "standalone"` für ein schlankes Production-Image.

---

## 🔧 Skripte

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Production-Build |
| `npm run start` | Production-Server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript ohne Emit |
| `npm run db:push` | Prisma-Schema in die DB schreiben |

---

Made in EU · DSGVO-konform.
