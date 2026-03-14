create table if not exists kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  doc_type text check (doc_type in ('passport','drivers_license','national_id','utility_bill','business_registration')),
  status text default 'pending' check (status in ('pending','under_review','verified','rejected')),
  storage_path text,
  rejection_reason text,
  submitted_at timestamptz default now(),
  verified_at timestamptz
);

alter table kyc_documents enable row level security;

drop policy if exists "users_own_docs" on kyc_documents;
create policy "users_own_docs" on kyc_documents for all
using (auth.uid() = user_id);

drop policy if exists "admin_can_review" on kyc_documents;
create policy "admin_can_review" on kyc_documents for all
using (auth.jwt() ->> 'role' in ('partner_admin','super_admin'));
