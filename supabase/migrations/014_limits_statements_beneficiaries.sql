create table if not exists limits (
  id uuid primary key default gen_random_uuid(),
  entity_type text check (entity_type in ('card','account')),
  entity_id uuid not null,
  daily_limit numeric(18,2),
  monthly_limit numeric(18,2),
  per_transaction_limit numeric(18,2),
  allowed_merchant_categories text[] default '{}',
  blocked_merchant_categories text[] default '{}',
  updated_at timestamptz default now()
);

create table if not exists statements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  period_start timestamptz,
  period_end timestamptz,
  storage_path text,
  generated_at timestamptz default now()
);

create table if not exists beneficiaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  routing_number text not null,
  account_number_hash text not null,
  bank_name text,
  created_at timestamptz default now()
);

alter table limits enable row level security;
alter table statements enable row level security;
alter table beneficiaries enable row level security;

drop policy if exists "users_own_beneficiaries" on beneficiaries;
create policy "users_own_beneficiaries" on beneficiaries for all
using (auth.uid() = user_id);
