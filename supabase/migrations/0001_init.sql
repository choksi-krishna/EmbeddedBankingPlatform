create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.partners (
  id text primary key,
  name text not null,
  slug text not null unique,
  status text not null check (status in ('active', 'onboarding', 'suspended')),
  tier text not null check (tier in ('starter', 'growth', 'enterprise')),
  settlement_account_id text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  partner_id text references public.partners(id) on delete set null,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('platform_admin', 'partner_admin', 'operator', 'viewer')),
  status text not null check (status in ('active', 'invited', 'suspended')) default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_sign_in_at timestamptz
);

create table if not exists public.accounts (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  account_number text not null unique,
  routing_number text not null,
  type text not null check (type in ('operating', 'wallet', 'reserve')),
  status text not null check (status in ('active', 'pending', 'frozen')) default 'pending',
  nickname text not null,
  currency text not null default 'USD',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.partners
  add constraint partners_settlement_account_id_fkey
  foreign key (settlement_account_id)
  references public.accounts(id)
  on delete set null;

create table if not exists public.balances (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  account_id text not null unique references public.accounts(id) on delete cascade,
  available numeric(18,2) not null default 0,
  pending numeric(18,2) not null default 0,
  ledger numeric(18,2) not null default 0,
  currency text not null default 'USD',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transfers (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  source_account_id text not null references public.accounts(id) on delete cascade,
  destination_account_id text not null references public.accounts(id) on delete cascade,
  amount numeric(18,2) not null check (amount > 0),
  currency text not null default 'USD',
  rail text not null check (rail in ('ach', 'book')),
  status text not null check (status in ('pending', 'processing', 'settled', 'failed')) default 'pending',
  external_reference text,
  initiated_by_user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  settled_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  account_id text not null references public.accounts(id) on delete cascade,
  transfer_id text references public.transfers(id) on delete set null,
  direction text not null check (direction in ('credit', 'debit')),
  kind text not null check (kind in ('deposit', 'withdrawal', 'transfer', 'card_authorization', 'card_settlement', 'fee')),
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null check (status in ('pending', 'processing', 'settled', 'failed')) default 'pending',
  description text not null,
  counterparty text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  posted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cards (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  account_id text not null references public.accounts(id) on delete cascade,
  cardholder_name text not null,
  brand text not null check (brand in ('Visa', 'Mastercard')),
  last4 text not null,
  type text not null check (type in ('virtual')),
  status text not null check (status in ('active', 'frozen', 'cancelled')) default 'active',
  spending_limit numeric(18,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.kyc_documents (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  document_type text not null check (document_type in ('passport', 'drivers_license', 'business_registration')),
  file_name text not null,
  storage_path text,
  status text not null check (status in ('pending', 'approved', 'rejected', 'needs_review')) default 'pending',
  notes text,
  uploaded_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewer_user_id uuid references public.users(id) on delete set null
);

create table if not exists public.compliance_records (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  account_id text references public.accounts(id) on delete set null,
  type text not null check (type in ('kyc', 'aml', 'transaction_monitoring')),
  status text not null check (status in ('clear', 'monitor', 'restricted')) default 'monitor',
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  notes text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.api_keys (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  name text not null,
  prefix text not null unique,
  key_hash text not null,
  permissions text[] not null default '{}',
  status text not null check (status in ('active', 'revoked')) default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  last_used_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.webhooks (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  url text not null,
  signing_secret text not null,
  events text[] not null default '{}',
  status text not null check (status in ('active', 'paused')) default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  last_delivery_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')) default 'info',
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create or replace function public.current_partner_id()
returns text
language sql
stable
as $$
  select partner_id from public.users where id = auth.uid()
$$;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_role() = 'platform_admin', false)
$$;

create or replace function public.can_access_partner(target_partner_id text)
returns boolean
language sql
stable
as $$
  select coalesce(
    public.is_platform_admin()
    or public.current_partner_id() = target_partner_id,
    false
  )
$$;

create or replace function public.can_manage_partner(target_partner_id text)
returns boolean
language sql
stable
as $$
  select coalesce(
    public.is_platform_admin()
    or (
      public.current_partner_id() = target_partner_id
      and public.current_role() in ('partner_admin', 'operator')
    ),
    false
  )
$$;

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at before update on public.partners
for each row execute procedure public.set_updated_at();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at before update on public.accounts
for each row execute procedure public.set_updated_at();

drop trigger if exists transfers_set_updated_at on public.transfers;
create trigger transfers_set_updated_at before update on public.transfers
for each row execute procedure public.set_updated_at();

drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at before update on public.cards
for each row execute procedure public.set_updated_at();

drop trigger if exists compliance_records_set_updated_at on public.compliance_records;
create trigger compliance_records_set_updated_at before update on public.compliance_records
for each row execute procedure public.set_updated_at();

drop trigger if exists api_keys_set_updated_at on public.api_keys;
create trigger api_keys_set_updated_at before update on public.api_keys
for each row execute procedure public.set_updated_at();

drop trigger if exists webhooks_set_updated_at on public.webhooks;
create trigger webhooks_set_updated_at before update on public.webhooks
for each row execute procedure public.set_updated_at();

alter table public.partners enable row level security;
alter table public.users enable row level security;
alter table public.accounts enable row level security;
alter table public.balances enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;
alter table public.cards enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.compliance_records enable row level security;
alter table public.api_keys enable row level security;
alter table public.webhooks enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "partners_select" on public.partners;
create policy "partners_select" on public.partners
for select using (
  public.is_platform_admin() or id = public.current_partner_id()
);

drop policy if exists "partners_manage" on public.partners;
create policy "partners_manage" on public.partners
for all using (
  public.is_platform_admin() or public.can_manage_partner(id)
)
with check (
  public.is_platform_admin() or public.can_manage_partner(id)
);

drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users
for select using (
  id = auth.uid()
  or public.is_platform_admin()
  or public.can_access_partner(partner_id)
);

drop policy if exists "users_manage" on public.users;
create policy "users_manage" on public.users
for all using (
  id = auth.uid()
  or public.is_platform_admin()
  or public.can_manage_partner(partner_id)
)
with check (
  id = auth.uid()
  or public.is_platform_admin()
  or public.can_manage_partner(partner_id)
);

drop policy if exists "accounts_access" on public.accounts;
create policy "accounts_access" on public.accounts
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "balances_access" on public.balances;
create policy "balances_access" on public.balances
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "transactions_access" on public.transactions;
create policy "transactions_access" on public.transactions
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "transfers_access" on public.transfers;
create policy "transfers_access" on public.transfers
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "cards_access" on public.cards;
create policy "cards_access" on public.cards
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "kyc_access" on public.kyc_documents;
create policy "kyc_access" on public.kyc_documents
for all using (
  user_id = auth.uid()
  or public.can_access_partner(partner_id)
)
with check (public.can_manage_partner(partner_id));

drop policy if exists "compliance_access" on public.compliance_records;
create policy "compliance_access" on public.compliance_records
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "api_keys_access" on public.api_keys;
create policy "api_keys_access" on public.api_keys
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "webhooks_access" on public.webhooks;
create policy "webhooks_access" on public.webhooks
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "notifications_access" on public.notifications;
create policy "notifications_access" on public.notifications
for select using (public.can_access_partner(partner_id));

create index if not exists idx_users_partner_id on public.users(partner_id);
create index if not exists idx_accounts_partner_id on public.accounts(partner_id);
create index if not exists idx_balances_partner_id on public.balances(partner_id);
create index if not exists idx_transactions_partner_id on public.transactions(partner_id, created_at desc);
create index if not exists idx_transfers_partner_id on public.transfers(partner_id, created_at desc);
create index if not exists idx_cards_partner_id on public.cards(partner_id);
create index if not exists idx_kyc_documents_partner_id on public.kyc_documents(partner_id, uploaded_at desc);
create index if not exists idx_compliance_records_partner_id on public.compliance_records(partner_id, created_at desc);
create index if not exists idx_api_keys_partner_id on public.api_keys(partner_id);
create index if not exists idx_webhooks_partner_id on public.webhooks(partner_id);
create index if not exists idx_notifications_partner_id on public.notifications(partner_id, created_at desc);
