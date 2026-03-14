create table if not exists compliance_records (
  id uuid primary key default gen_random_uuid(),
  entity_type text check (entity_type in ('user','account','transaction')),
  entity_id uuid not null,
  action text not null,
  performed_by uuid references users(id),
  notes text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table compliance_records enable row level security;

drop policy if exists "admin_only" on compliance_records;
create policy "admin_only" on compliance_records
using (auth.jwt() ->> 'role' in ('partner_admin','super_admin'));
