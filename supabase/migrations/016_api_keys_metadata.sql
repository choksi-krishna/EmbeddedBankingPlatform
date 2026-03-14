alter table public.api_keys
  add column if not exists metadata jsonb not null default '{}'::jsonb;
