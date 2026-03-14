create table if not exists fraud_alerts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  transaction_id uuid references transactions(id),
  risk_score numeric(5,2) check (risk_score between 0 and 100),
  reason text,
  status text default 'open' check (status in ('open','investigating','resolved','false_positive')),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists fee_schedules (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  fee_type text check (fee_type in ('ach','wire','card_issuance','monthly','per_transaction','interchange_share')),
  fixed_amount numeric(10,4) default 0,
  percentage numeric(5,4) default 0,
  config jsonb default '{}',
  effective_from timestamptz default now()
);

alter table fraud_alerts enable row level security;
alter table fee_schedules enable row level security;

drop policy if exists "admin_only" on fraud_alerts;
create policy "admin_only" on fraud_alerts
using (auth.jwt() ->> 'role' in ('partner_admin','super_admin'));

drop policy if exists "partner_scope" on fee_schedules;
create policy "partner_scope" on fee_schedules for all
using ((auth.jwt() ->> 'partner_id')::uuid = partner_id);
