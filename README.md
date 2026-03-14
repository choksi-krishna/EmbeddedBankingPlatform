# Banking Workspace Embedded Banking Platform

Full-stack embedded banking prototype built with Next.js App Router, TypeScript, TailwindCSS, and Supabase.

## What is included

- Supabase Auth login/signup flow with mock fallback when env vars are missing
- Supabase session refresh middleware for App Router SSR auth state
- Multi-tenant partner model with Row Level Security policies
- Partner dashboard for accounts, balances, transactions, transfers, cards, KYC, compliance, analytics, and API keys
- Next.js route handlers for banking APIs under `/api/*`
- Server actions for account creation, transfers, card issuance, KYC uploads, webhook registration, and API key generation
- Mock sandbox workspace so the app can run before Supabase is configured

## Local setup

1. Copy [.env.example](/home/bacancy/Work/embedded-baas-platform/.env.example) to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Set `DATABASE_URL` if you want to apply the SQL migration with `npm run db:migrate`.
4. Set `SUPABASE_SERVICE_ROLE_KEY` if you want partner bootstrapping, invitations, KYC uploads, or `npm run db:seed`.
5. Run `npm run db:migrate` to apply [supabase/migrations/0001_init.sql](/home/bacancy/Work/embedded-baas-platform/supabase/migrations/0001_init.sql).
6. Run `npm run db:seed` to create a seed auth user and baseline tenant data.
7. Install dependencies and run `npm run dev`.

If Supabase env vars are omitted, the platform loads seeded mock data and uses the sandbox API key `baas.orbitdemo01.secret123`.

## Database commands

- `npm run db:migrate`: applies the schema in [supabase/migrations/0001_init.sql](/home/bacancy/Work/embedded-baas-platform/supabase/migrations/0001_init.sql) using `DATABASE_URL`
- `npm run db:seed`: uses the Supabase service role key to create a seed auth user and seed partner/account/API data

The seed script creates:

- partner `partner-orbit`
- partner admin `ops@orbit.example`
- account `acct-orbit-operating`
- balance, API key, webhook, compliance record, card, KYC document, notification, transfer, and transaction demo rows

## Project structure

- [app](/home/bacancy/Work/embedded-baas-platform/app): App Router pages, layouts, server actions, and API routes
- [components](/home/bacancy/Work/embedded-baas-platform/components): reusable dashboard and form primitives
- [middleware.ts](/home/bacancy/Work/embedded-baas-platform/middleware.ts): session refresh middleware for Supabase SSR auth
- [lib/services/platform.ts](/home/bacancy/Work/embedded-baas-platform/lib/services/platform.ts): tenant-aware domain logic for reads and mutations
- [lib/services/auth.ts](/home/bacancy/Work/embedded-baas-platform/lib/services/auth.ts): Supabase Auth integration
- [scripts](/home/bacancy/Work/embedded-baas-platform/scripts): migration and seed scripts for Supabase setup
- [supabase](/home/bacancy/Work/embedded-baas-platform/supabase): schema, policies, and seed SQL

## API surface

- `GET/POST /api/auth`
- `GET/POST /api/users`
- `GET/POST /api/accounts`
- `GET /api/transactions`
- `GET/POST /api/transfers`
- `GET/POST /api/cards`
- `GET/POST /api/kyc`
- `GET/POST /api/webhooks`
- `GET /api/partners`
- `GET /api/analytics`

## Deployment notes

- Vercel-ready App Router structure
- Supabase Storage bucket expected for KYC uploads: `kyc-documents`
- Service role key is required for tenant bootstrapping, invitations, API key verification via route handlers, and storage uploads
