# HubSpot Tips Slack Bot

## Doel
Een Slack app die wekelijks automatisch HubSpot tips stuurt naar geïnstalleerde Slack workspaces. Bedrijven installeren de app via een "Add to Slack" OAuth flow. De tips worden beheerd in Supabase. De wekelijkse verzending loopt via een Vercel Cron Job.

## Tech Stack
- **Framework**: Next.js 14 met App Router en TypeScript
- **Hosting**: Vercel (gratis tier)
- **Database**: Supabase (PostgreSQL)
- **Tips beheer**: Supabase (tabel: tips)
- **Scheduler**: Vercel Cron Jobs (elke maandag 08:00 UTC)
- **Integratie**: Slack API (OAuth 2.0 + chat.postMessage)

## Architectuur
De kern bestaat uit vier onderdelen:
1. OAuth flow (twee routes: /api/slack/oauth en /api/slack/callback)
2. Cron job die wekelijks tips verstuurt (/api/cron/send-tips)
3. Supabase voor opslag van Slack installaties per workspace én de tips
4. Tips worden opgehaald uit de Supabase `tips` tabel waar is_active = true
5. De tip_index in `installations` bepaalt welke tip een workspace als volgende krijgt

## Database
Twee tabellen in Supabase:

### installations
Slaat per workspace op hoe de Slack app geïnstalleerd is.
- id (uuid)
- team_id (text, unique) — Slack workspace ID
- team_name (text)
- channel_id (text) — welk channel de tips ontvangt
- access_token (text) — Slack bot token
- is_active (boolean, default true)
- installed_at (timestamp)
- last_tip_sent_at (timestamp)
- tip_index (int, default 0) — index van de volgende te sturen tip

### tips
Bevat alle HubSpot tips die verstuurd worden.
- id (uuid)
- tip (text) — de inhoud van de tip
- category (text) — bijv. Sales, Marketing
- is_active (boolean, default true)
- created_at (timestamp)

## Mappenstructuur
```
hubspot-tips-bot/
├── app/
│   ├── api/
│   │   ├── slack/
│   │   │   ├── oauth/route.ts        # Stap 1: redirect naar Slack
│   │   │   └── callback/route.ts     # Stap 2: ontvang token, sla op
│   │   └── cron/
│   │       └── send-tips/route.ts    # Wekelijkse job
│   └── page.tsx                      # Simpele pagina met "Add to Slack" knop
├── lib/
│   ├── slack.ts                      # Slack API helpers
│   └── supabase.ts                   # Supabase client
├── supabase/
│   └── schema.sql                    # Database schema
└── vercel.json                       # Cron config
```

## Coding conventions
- Altijd TypeScript, geen any types
- Elke API route bevat error handling en logt fouten
- Secrets alleen via environment variables, nooit hardcoded
- Cron route is beveiligd met CRON_SECRET header check
- Functies zijn klein en single-purpose

## Environment variables
```
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

## Voortgang
- [x] Project setup (Next.js, CLAUDE.md, .env.local)
- [x] Supabase schema aangemaakt (installations + tips tabellen)
- [x] Test tips toegevoegd aan Supabase
- [x] Slack app geregistreerd op api.slack.com
- [x] OAuth scopes ingesteld (chat:write, incoming-webhook)
- [x] Redirect URL ingesteld
- [x] API keys in .env.local gezet
- [x] Supabase client installeren en lib/supabase.ts bouwen
- [x] Slack OAuth flow bouwen (oauth + callback routes)
- [ ] Cron job bouwen (send-tips route)
- [ ] vercel.json configureren
- [ ] Deployen op Vercel
- [ ] Testen met eigen workspace