create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  type text check (type in ('debit','credit','fee','reversal')),
  amount numeric(18,2) not null check (amount > 0),
  currency text default 'USD',
  status text default 'pending' check (status in ('pending','completed','failed','reversed')),
  description text,
  metadata jsonb default '{}',
  is_sandbox boolean default false,
  created_at timestamptz default now()
);

alter table transactions enable row level security;

drop policy if exists "via_account_owner" on transactions;
create policy "via_account_owner" on transactions for select
using (
  exists (
    select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()
  )
);

drop policy if exists "partner_admin_scope" on transactions;
create policy "partner_admin_scope" on transactions for select
using (
  exists (
    select 1 from accounts a
    where a.id = account_id
    and a.partner_id = (auth.jwt() ->> 'partner_id')::uuid
  )
);

create index if not exists idx_transactions_account_id on transactions(account_id);
create index if not exists idx_transactions_created_at on transactions(created_at desc);
