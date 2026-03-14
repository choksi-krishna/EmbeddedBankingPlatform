create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  from_account_id uuid references accounts(id),
  to_account_id uuid references accounts(id),
  amount numeric(18,2) not null check (amount > 0),
  currency text default 'USD',
  type text check (type in ('ach','wire','internal','direct_deposit')),
  status text default 'pending' check (status in ('pending','processing','completed','failed','cancelled')),
  initiated_at timestamptz default now(),
  completed_at timestamptz,
  metadata jsonb default '{}'
);

alter table transfers enable row level security;

drop policy if exists "via_account_owner" on transfers;
create policy "via_account_owner" on transfers for select
using (
  exists (
    select 1 from accounts a
    where (a.id = from_account_id or a.id = to_account_id)
    and a.user_id = auth.uid()
  )
);
