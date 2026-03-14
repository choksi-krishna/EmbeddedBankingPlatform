create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  partner_id uuid references partners(id),
  full_name text,
  email text,
  role text default 'user' check (role in ('user','partner_admin','super_admin')),
  kyc_status text default 'pending' check (kyc_status in ('pending','submitted','under_review','verified','rejected')),
  is_sandbox boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table users enable row level security;

drop policy if exists "users_own_row" on users;
create policy "users_own_row" on users for select
using (auth.uid() = id);

drop policy if exists "partner_admin_same_partner" on users;
create policy "partner_admin_same_partner" on users for select
using (
  (auth.jwt() ->> 'partner_id')::uuid = partner_id
  and auth.jwt() ->> 'role' in ('partner_admin','super_admin')
);

drop policy if exists "super_admin_all" on users;
create policy "super_admin_all" on users
using (auth.jwt() ->> 'role' = 'super_admin');

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
