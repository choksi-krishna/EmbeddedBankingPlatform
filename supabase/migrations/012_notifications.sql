create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text check (type in ('transaction','kyc_update','fraud_alert','card_freeze','transfer')),
  title text not null,
  message text not null,
  read boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table notifications enable row level security;

drop policy if exists "users_own_notifications" on notifications;
create policy "users_own_notifications" on notifications for all
using (auth.uid() = user_id);
