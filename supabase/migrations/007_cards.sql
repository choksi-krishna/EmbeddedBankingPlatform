create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  card_number_last4 text not null,
  card_token text unique default gen_random_uuid()::text,
  type text default 'virtual' check (type in ('virtual','physical')),
  status text default 'active' check (status in ('active','frozen','cancelled')),
  spending_limits jsonb default '{"daily_limit":null,"per_transaction_limit":null,"blocked_merchant_categories":[]}',
  expiry_month int,
  expiry_year int,
  created_at timestamptz default now()
);

alter table cards enable row level security;

drop policy if exists "via_account_owner" on cards;
create policy "via_account_owner" on cards for all
using (
  exists (
    select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()
  )
);
