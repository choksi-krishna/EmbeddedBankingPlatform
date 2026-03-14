create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  operation text check (operation in ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  performed_by uuid,
  ip_address text,
  created_at timestamptz default now()
);

create table if not exists api_usage (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  endpoint text not null,
  method text not null,
  response_status int,
  response_time_ms int,
  created_at timestamptz default now()
);

alter table audit_log enable row level security;
alter table api_usage enable row level security;

drop policy if exists "super_admin_only" on audit_log;
create policy "super_admin_only" on audit_log
using (auth.jwt() ->> 'role' = 'super_admin');

drop policy if exists "partner_scope" on api_usage;
create policy "partner_scope" on api_usage for select
using ((auth.jwt() ->> 'partner_id')::uuid = partner_id);

alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table balances;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table fraud_alerts;
alter publication supabase_realtime add table transfers;
