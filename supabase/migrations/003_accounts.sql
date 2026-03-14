create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  partner_id uuid references partners(id),
  account_number text unique default lpad(floor(random()*10000000000)::text, 10, '0'),
  routing_number text default '021000021',
  type text default 'checking' check (type in ('checking','savings','business')),
  balance numeric(18,2) default 0.00,
  currency text default 'USD',
  status text default 'active' check (status in ('active','frozen','closed')),
  overdraft_protection boolean default false,
  is_sandbox boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table accounts enable row level security;

drop policy if exists "users_own_accounts" on accounts;
create policy "users_own_accounts" on accounts for all
using (auth.uid() = user_id);

drop policy if exists "partner_admin_scope" on accounts;
create policy "partner_admin_scope" on accounts for all
using (
  (auth.jwt() ->> 'partner_id')::uuid = partner_id
  and auth.jwt() ->> 'role' in ('partner_admin','super_admin')
);
