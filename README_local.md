# HubSpot Enablement

**Type:** Hobby project (geen Jira ticket)
**Status:** In progress — werkt momenteel niet
**Eigenaar:** Tom Schoorstra

---

## Doel

HubSpot-kennis op grotere schaal delen met collega's binnen AIHR. Mensen beter leren werken met HubSpot via een laagdrempelige, wekelijkse tip of trick.

---

## Hoe het werkt (huidige setup)

1. **Supabase database** — tabel met HubSpot tips en tricks
2. **Cron job** — triggert elke maandag
3. **Slack** — tip wordt automatisch gepost in een kanaal

---

## Huidige status

De cron + Slack-integratie werkt momenteel **niet**. Moet worden opgespoord en gefixed.

---

## Openstaande vragen

- Wat werkt er precies niet? (cron, Supabase connectie, Slack webhook?)
- Welk Slack-kanaal wordt gebruikt?
- Hoe ziet de Supabase tabel eruit? (schema, aantal tips, categorieën?)
- Hoe is de cron opgezet? (Zapier, Supabase scheduled functions, iets anders?)
- Hoe wordt een tip geselecteerd? (random, sequentieel, op basis van tag?)

---

## Ideeën / verbeteringen

- Betere selectielogica voor tips (bijv. op thema of niveau)
- Beheer van tips via deze omgeving (toevoegen, taggen, reviewen met Claude)
- Tracking van welke tips al verstuurd zijn
- Uitbreiden naar meerdere kanalen of doelgroepen

---

## Gerelateerde bestanden

_Nog leeg — wordt aangevuld naarmate het project groeit._
