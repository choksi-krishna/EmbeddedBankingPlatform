create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  api_key_hash text,
  tier text default 'starter' check (tier in ('starter','growth','enterprise')),
  config jsonb default '{"sandbox_mode":true,"rate_limit_per_minute":60,"allowed_features":[]}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table partners enable row level security;

drop policy if exists "super_admin_all" on partners;
create policy "super_admin_all" on partners
using (auth.jwt() ->> 'role' = 'super_admin');
