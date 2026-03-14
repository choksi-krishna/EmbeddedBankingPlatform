create table if not exists balances (
  id uuid primary key default gen_random_uuid(),
  account_id uuid unique references accounts(id) on delete cascade,
  available numeric(18,2) default 0.00,
  pending numeric(18,2) default 0.00,
  currency text default 'USD',
  updated_at timestamptz default now()
);

alter table balances enable row level security;

drop policy if exists "via_account_owner" on balances;
create policy "via_account_owner" on balances for select
using (
  exists (
    select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()
  )
);
