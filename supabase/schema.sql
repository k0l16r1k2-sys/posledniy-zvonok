create extension if not exists pgcrypto;
drop table if exists final_accusations cascade;
drop table if exists public_game_state cascade;
drop table if exists players cascade;
drop table if exists rooms cascade;

create table rooms(
 id uuid primary key default gen_random_uuid(),
 code text unique not null,
 host_name text not null,
 host_token text not null,
 phase text not null default 'LOBBY',
 created_at timestamptz not null default now()
);
create table players(
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references rooms(id) on delete cascade,
 name text not null,
 role text,
 player_token text not null,
 connected boolean not null default true,
 joined_at timestamptz not null default now()
);
create table public_game_state(
 room_id uuid primary key references rooms(id) on delete cascade,
 opened_clues text[] not null default '{}',
 updated_at timestamptz not null default now()
);
create table final_accusations(
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references rooms(id) on delete cascade,
 player_id uuid not null references players(id) on delete cascade,
 suspect text not null,
 reasoning text not null default '',
 created_at timestamptz not null default now(),
 unique(room_id,player_id)
);

alter table rooms enable row level security;
alter table players enable row level security;
alter table public_game_state enable row level security;
alter table final_accusations enable row level security;

-- ВАЖНО: публичный браузер ничего напрямую из этих таблиц не читает.
-- Все чтение/изменение выполняет сервер сайта через SUPABASE_SERVICE_ROLE_KEY.
-- Поэтому host_token и player_token не выдаются клиенту через Supabase.
