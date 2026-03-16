# HubSpot Tips Bot — Project Overview

_Laatste update: 16-03-2026_

## Wat is dit?

Een Slack bot die elke maandag automatisch een HubSpot tip stuurt naar geïnstalleerde Slack workspaces. Bedrijven installeren de bot via een "Add to Slack" knop. De tips komen uit een Supabase database. De verzending loopt via een Vercel Cron Job.

**Status: werkt momenteel niet** — to do's staan onderaan dit document.

---

## Tech stack

| Onderdeel | Tool |
|-----------|------|
| Framework | Next.js (App Router, TypeScript) |
| Hosting | Vercel (gratis tier) |
| Database | Supabase (PostgreSQL) |
| Cron | Vercel Cron Jobs |
| Integratie | Slack API (OAuth 2.0 + chat.postMessage) |

---

## Mappenstructuur

```
hubspot-enablement/
├── app/
│   ├── api/
│   │   ├── slack/
│   │   │   ├── oauth/route.ts        # Stap 1: redirect naar Slack OAuth
│   │   │   └── callback/route.ts     # Stap 2: ontvang token, sla op in Supabase
│   │   └── cron/
│   │       └── send-tips/route.ts    # Wekelijkse job: haalt tips op en post naar Slack
│   ├── page.tsx                      # Landingspagina met "Add to Slack" knop
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── slack.ts                      # Slack API helpers (OAuth exchange, sendMessage, joinChannel)
│   └── supabase.ts                   # Supabase client (service role key)
├── supabase/
│   └── schema.sql                    # Database schema (zie sectie Database)
├── docs/
│   └── project-overview.md          # Dit bestand
├── vercel.json                       # Cron schedule: elke maandag 08:00 UTC
├── CLAUDE.md                         # Projectdocumentatie (coding conventions, voortgang)
└── README.md                         # Standaard Next.js README
```

---

## Hoe het werkt

### 1. Installatie (OAuth flow)
1. Gebruiker klikt "Add to Slack" op de landingspagina
2. `/api/slack/oauth` genereert een state token en redirect naar Slack
3. Slack redirect terug naar `/api/slack/callback`
4. Callback wisselt de code in voor een bot token
5. Workspace wordt opgeslagen in de `installations` tabel in Supabase
6. Bot joint het gekozen kanaal

### 2. Wekelijkse tip (Cron)
1. Vercel triggert `/api/cron/send-tips` elke maandag 08:00 UTC
2. Route haalt alle actieve installaties op uit Supabase
3. Route haalt alle actieve tips op uit Supabase (gesorteerd op `created_at`)
4. Per workspace: pakt tip op index `tip_index % totaal_tips` (cycled)
5. Post de tip naar het Slack kanaal via `chat.postMessage`
6. Verhoogt `tip_index` en update `last_tip_sent_at` in Supabase

### 3. Tip format in Slack
```
💡 *HubSpot Tip van de Week*

<tip content>

🏷️ *Object:* Contact
📊 *Niveau:* Easy
⚡ *Type:* Best Practice
```

---

## Database (Supabase)

### `installations` — één rij per Slack workspace
| Kolom | Type | Omschrijving |
|-------|------|-------------|
| id | uuid | Primary key |
| team_id | text (unique) | Slack workspace ID |
| team_name | text | Naam van de workspace |
| channel_id | text | Kanaal dat tips ontvangt |
| access_token | text | Slack bot token |
| is_active | boolean | Of de installatie actief is |
| installed_at | timestamp | Wanneer geïnstalleerd |
| last_tip_sent_at | timestamp | Wanneer laatste tip verstuurd |
| tip_index | integer | Welke tip als volgende verstuurd wordt |

### `tips` — alle HubSpot tips
| Kolom | Type | Omschrijving |
|-------|------|-------------|
| id | uuid | Primary key |
| tip | text | De tip zelf |
| category | text | Bijv. Sales, Marketing |
| object | text | contact / company / deal / ticket / all |
| difficulty | text | easy / moderate / expert |
| hubspot_edition | text | starter / professional / enterprise / all |
| tip_type | text | productivity / automation / reporting / best_practice |
| is_active | boolean | Of de tip actief is |
| created_at | timestamp | Aanmaakdatum |

**Let op:** `schema.sql` in de repo definieert alleen `tip` en `category`. De overige kolommen moeten handmatig zijn toegevoegd of staan niet in Supabase. Dit is een mogelijke oorzaak van problemen.

---

## Environment variables (Vercel + .env.local)

```
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=       # Staat in de config maar wordt nog niet gebruikt in de code
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=                # Beveiligt de cron route
```

---

## To do's om het te fixen

### Stap 1 — Diagnose
- [ ] Check Vercel deployment logs: triggert de cron job überhaupt?
- [ ] Check Supabase `installations` tabel: staat er een rij in? (Zo nee: OAuth flow werkt niet of is nooit succesvol afgerond)
- [ ] Check Supabase `tips` tabel: staan er actieve tips in? (`is_active = true`)
- [ ] Check of alle kolommen in de `tips` tabel bestaan (`object`, `difficulty`, `hubspot_edition`, `tip_type`) — of dat de schema.sql niet volledig deployed is

### Stap 2 — Testen
- [ ] Handmatig de cron triggeren: `GET /api/cron/send-tips` met `Authorization: Bearer <CRON_SECRET>` header
- [ ] Kijk of de response `{ sent: 0 }` of een error teruggeeft
- [ ] Als `sent: 0`: het probleem zit in `installations` (geen actieve workspaces)
- [ ] Als error: log de exacte foutmelding en debug van daaruit

### Stap 3 — Fix
- [ ] Als schema incompleet: volledige schema.sql deployen in Supabase
- [ ] Als geen installaties: OAuth flow opnieuw doorlopen en controleren of callback correct werkt
- [ ] Als cron niet triggert: controleer Vercel plan (gratis tier heeft beperkingen) en `vercel.json`
