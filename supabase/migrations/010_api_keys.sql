create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  name text not null,
  key_hash text unique not null,
  permissions text[] default '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table api_keys enable row level security;

drop policy if exists "partner_admin_own_keys" on api_keys;
create policy "partner_admin_own_keys" on api_keys for all
using (
  (auth.jwt() ->> 'partner_id')::uuid = partner_id
  and auth.jwt() ->> 'role' in ('partner_admin','super_admin')
);
