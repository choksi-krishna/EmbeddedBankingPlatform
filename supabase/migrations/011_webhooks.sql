create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  url text not null,
  events text[] default '{}',
  secret_hash text,
  is_active boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references webhooks(id),
  event_type text not null,
  payload jsonb default '{}',
  response_status int,
  attempts int default 0,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

alter table webhooks enable row level security;
alter table webhook_events enable row level security;

drop policy if exists "partner_scope" on webhooks;
create policy "partner_scope" on webhooks for all
using ((auth.jwt() ->> 'partner_id')::uuid = partner_id);
