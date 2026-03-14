insert into public.partners (
  id,
  name,
  slug,
  status,
  tier,
  settings
) values (
  'partner-orbit',
  'Orbit Treasury',
  'orbit-treasury',
  'active',
  'enterprise',
  '{"allowedWebhookEvents":["account.created","transfer.settled","card.issued","kyc.updated"],"region":"US","riskProfile":"moderate"}'::jsonb
)
on conflict (id) do nothing;

with first_auth_user as (
  select id, email
  from auth.users
  order by created_at asc
  limit 1
)
insert into public.users (
  id,
  partner_id,
  email,
  full_name,
  role,
  status
)
select
  first_auth_user.id,
  'partner-orbit',
  coalesce(first_auth_user.email, 'ops@orbit.example'),
  'Orbit Admin',
  'partner_admin',
  'active'
from first_auth_user
on conflict (id) do nothing;

insert into public.accounts (
  id,
  partner_id,
  user_id,
  account_number,
  routing_number,
  type,
  status,
  nickname,
  currency
)
select
  'acct-orbit-operating',
  'partner-orbit',
  users.id,
  '100000013579',
  '011000015',
  'operating',
  'active',
  'Primary Operating',
  'USD'
from public.users
where partner_id = 'partner-orbit'
limit 1
on conflict (id) do nothing;

insert into public.balances (
  id,
  partner_id,
  account_id,
  available,
  pending,
  ledger,
  currency
) values (
  'bal-orbit-operating',
  'partner-orbit',
  'acct-orbit-operating',
  285400.12,
  12500.00,
  297900.12,
  'USD'
)
on conflict (id) do nothing;

insert into public.api_keys (
  id,
  partner_id,
  name,
  prefix,
  key_hash,
  permissions,
  status
) values (
  'api-6001',
  'partner-orbit',
  'Orbit Sandbox SDK',
  'orbitdemo01',
  '70846dc7c58f4d9ffb4af3ebf995709fc72fc2300a9bcf5d6905e2dfe7cc03b4',
  array['accounts:read','transactions:read','transfers:write','webhooks:read'],
  'active'
)
on conflict (id) do nothing;
