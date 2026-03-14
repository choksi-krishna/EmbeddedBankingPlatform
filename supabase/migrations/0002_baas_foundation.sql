create extension if not exists pgcrypto;

alter table public.users
  add column if not exists kyc_status text not null default 'pending'
    check (kyc_status in ('pending', 'approved', 'rejected', 'needs_review'));

alter table public.partners
  add column if not exists api_key_hash text,
  add column if not exists config jsonb not null default '{}'::jsonb,
  add column if not exists is_active boolean not null default true;

update public.partners
set
  config = case
    when config = '{}'::jsonb then coalesce(settings, '{}'::jsonb) || jsonb_build_object(
      'sandboxMode',
      coalesce((settings ->> 'sandboxMode')::boolean, false),
      'region',
      coalesce(settings ->> 'region', 'US'),
      'riskProfile',
      coalesce(settings ->> 'riskProfile', 'moderate')
    )
    else config
  end,
  is_active = status <> 'suspended'
where true;

alter table public.accounts
  add column if not exists balance numeric(18,2) not null default 0;

alter table public.transactions
  add column if not exists type text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.transactions
set type = coalesce(type, kind)
where type is null;

alter table public.cards
  add column if not exists card_number_last4 text,
  add column if not exists card_token text,
  add column if not exists spending_limits jsonb not null default '{}'::jsonb;

update public.cards
set
  card_number_last4 = coalesce(card_number_last4, last4),
  spending_limits = case
    when spending_limits = '{}'::jsonb
      then jsonb_build_object('daily', spending_limit, 'monthly', spending_limit * 10)
    else spending_limits
  end
where card_number_last4 is null or spending_limits = '{}'::jsonb;

alter table public.transfers
  add column if not exists type text;

update public.transfers
set type = coalesce(type, rail)
where type is null;

alter table public.kyc_documents
  add column if not exists doc_type text,
  add column if not exists verified_at timestamptz;

update public.kyc_documents
set
  doc_type = coalesce(doc_type, document_type),
  verified_at = case
    when status = 'approved' then coalesce(verified_at, reviewed_at)
    else verified_at
  end
where doc_type is null or (status = 'approved' and verified_at is null);

alter table public.webhooks
  add column if not exists secret_hash text,
  add column if not exists is_active boolean not null default true;

update public.webhooks
set
  secret_hash = coalesce(secret_hash, encode(digest(signing_secret, 'sha256'), 'hex')),
  is_active = status = 'active'
where secret_hash is null or is_active <> (status = 'active');

alter table public.notifications
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists message text,
  add column if not exists read boolean not null default false,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.notifications
set
  message = coalesce(message, trim(concat(title, ': ', body))),
  read = coalesce(read_at is not null, false)
where message is null;

create table if not exists public.fee_schedules (
  id text primary key,
  partner_id text not null references public.partners(id) on delete cascade,
  fee_type text not null,
  amount numeric(18,2) not null default 0,
  percentage numeric(9,4) not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fraud_alerts (
  id text primary key,
  account_id text not null references public.accounts(id) on delete cascade,
  transaction_id text references public.transactions(id) on delete set null,
  risk_score integer not null check (risk_score between 0 and 100),
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null references public.partners(id) on delete cascade,
  route_key text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  last_request_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (partner_id, route_key, window_started_at)
);

create table if not exists public.supabase_audit (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  row_id text,
  partner_id text,
  actor_user_id uuid,
  actor_role text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.current_partner_id()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'partner_id',
    (select partner_id from public.users where id = auth.uid())
  )
$$;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    (select role from public.users where id = auth.uid())
  )
$$;

create or replace function public.sync_account_balance()
returns trigger
language plpgsql
as $$
begin
  update public.accounts
  set balance = new.ledger
  where id = new.account_id;
  return new;
end;
$$;

drop trigger if exists balances_sync_account_balance on public.balances;
create trigger balances_sync_account_balance
after insert or update of ledger on public.balances
for each row execute procedure public.sync_account_balance();

update public.accounts as accounts
set balance = coalesce(balances.ledger, 0)
from public.balances as balances
where balances.account_id = accounts.id;

create or replace function public.sync_auth_user_claims()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', new.role,
    'partner_id', new.partner_id,
    'kyc_status', new.kyc_status
  )
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists users_sync_auth_claims on public.users;
create trigger users_sync_auth_claims
after insert or update of role, partner_id, kyc_status on public.users
for each row execute procedure public.sync_auth_user_claims();

create or replace function public.audit_row_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  before_state jsonb;
  after_state jsonb;
begin
  before_state := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(old) end;
  after_state := case when tg_op = 'DELETE' then null else to_jsonb(new) end;

  insert into public.supabase_audit (
    table_name,
    action,
    row_id,
    partner_id,
    actor_user_id,
    actor_role,
    before_state,
    after_state
  )
  values (
    tg_table_name,
    tg_op,
    coalesce(after_state ->> 'id', before_state ->> 'id'),
    coalesce(after_state ->> 'partner_id', before_state ->> 'partner_id'),
    auth.uid(),
    public.current_role(),
    before_state,
    after_state
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists partners_audit_changes on public.partners;
create trigger partners_audit_changes
after insert or update or delete on public.partners
for each row execute procedure public.audit_row_changes();

drop trigger if exists users_audit_changes on public.users;
create trigger users_audit_changes
after insert or update or delete on public.users
for each row execute procedure public.audit_row_changes();

drop trigger if exists accounts_audit_changes on public.accounts;
create trigger accounts_audit_changes
after insert or update or delete on public.accounts
for each row execute procedure public.audit_row_changes();

drop trigger if exists transactions_audit_changes on public.transactions;
create trigger transactions_audit_changes
after insert or update or delete on public.transactions
for each row execute procedure public.audit_row_changes();

drop trigger if exists transfers_audit_changes on public.transfers;
create trigger transfers_audit_changes
after insert or update or delete on public.transfers
for each row execute procedure public.audit_row_changes();

drop trigger if exists cards_audit_changes on public.cards;
create trigger cards_audit_changes
after insert or update or delete on public.cards
for each row execute procedure public.audit_row_changes();

drop trigger if exists webhooks_audit_changes on public.webhooks;
create trigger webhooks_audit_changes
after insert or update or delete on public.webhooks
for each row execute procedure public.audit_row_changes();

drop trigger if exists api_keys_audit_changes on public.api_keys;
create trigger api_keys_audit_changes
after insert or update or delete on public.api_keys
for each row execute procedure public.audit_row_changes();

drop trigger if exists kyc_documents_audit_changes on public.kyc_documents;
create trigger kyc_documents_audit_changes
after insert or update or delete on public.kyc_documents
for each row execute procedure public.audit_row_changes();

drop trigger if exists fee_schedules_set_updated_at on public.fee_schedules;
create trigger fee_schedules_set_updated_at
before update on public.fee_schedules
for each row execute procedure public.set_updated_at();

drop trigger if exists fraud_alerts_set_updated_at on public.fraud_alerts;
create trigger fraud_alerts_set_updated_at
before update on public.fraud_alerts
for each row execute procedure public.set_updated_at();

alter table public.fee_schedules enable row level security;
alter table public.fraud_alerts enable row level security;
alter table public.api_rate_limits enable row level security;
alter table public.supabase_audit enable row level security;

drop policy if exists "fee_schedules_access" on public.fee_schedules;
create policy "fee_schedules_access" on public.fee_schedules
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "fraud_alerts_access" on public.fraud_alerts;
create policy "fraud_alerts_access" on public.fraud_alerts
for all using (
  public.can_access_partner(
    (select partner_id from public.accounts where id = account_id)
  )
)
with check (
  public.can_manage_partner(
    (select partner_id from public.accounts where id = account_id)
  )
);

drop policy if exists "api_rate_limits_access" on public.api_rate_limits;
create policy "api_rate_limits_access" on public.api_rate_limits
for all using (public.can_access_partner(partner_id))
with check (public.can_manage_partner(partner_id));

drop policy if exists "supabase_audit_select" on public.supabase_audit;
create policy "supabase_audit_select" on public.supabase_audit
for select using (
  public.is_platform_admin()
  or public.can_access_partner(partner_id)
);

create index if not exists idx_fee_schedules_partner_id
  on public.fee_schedules(partner_id);
create index if not exists idx_fraud_alerts_account_id
  on public.fraud_alerts(account_id, status, created_at desc);
create index if not exists idx_api_rate_limits_partner_route_window
  on public.api_rate_limits(partner_id, route_key, window_started_at desc);
create index if not exists idx_supabase_audit_partner_table_created
  on public.supabase_audit(partner_id, table_name, created_at desc);
