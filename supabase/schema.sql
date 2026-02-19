-- HubSpot Tips Slack Bot — database schema
-- Uitvoeren in de Supabase SQL editor

-- Tabel: installations
-- Slaat per Slack workspace op hoe de app is geïnstalleerd.
create table if not exists installations (
  id               uuid primary key default gen_random_uuid(),
  team_id          text not null unique,
  team_name        text not null,
  channel_id       text not null,
  access_token     text not null,
  is_active        boolean not null default true,
  installed_at     timestamptz not null default now(),
  last_tip_sent_at timestamptz,
  tip_index        integer not null default 0
);

-- Tabel: tips
-- Bevat alle HubSpot tips die wekelijks verstuurd worden.
create table if not exists tips (
  id         uuid primary key default gen_random_uuid(),
  tip        text not null,
  category   text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
