import Link from "next/link";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";

import { signupAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;

  return (
    <main className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8 2xl:px-10">
      <div className="lg:col-span-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white/80 font-display text-lg font-semibold text-ink shadow-[0_12px_30px_rgba(17,24,39,0.08)]">
              E
            </span>
            <span>
              <span className="block font-display text-2xl font-semibold text-ink">
                EmbeddyFi
              </span>
              <span className="block text-[0.7rem] uppercase tracking-[0.24em] text-slate-500">
                Workspace onboarding
              </span>
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[rgba(17,24,39,0.08)] bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="panel-surface relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-y-0 right-0 w-52 bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.18),transparent_72%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.16),transparent_64%)]" />
        <div className="relative space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-coral">
            Onboarding
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[0.96] text-ink">
            Launch a partner banking workspace for your team.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Create your workspace to manage accounts, transfers, cards,
            compliance, and integrations in one place.
          </p>
          {!isSupabaseConfigured ? (
            <Card className="max-w-2xl">
              <p className="text-sm leading-6 text-slate-600">
                The backend is not configured, so this form redirects into the mock
                sandbox workspace instead of creating a real tenant.
              </p>
            </Card>
          ) : null}
        </div>
      </div>

      <Card title="Create Workspace" eyebrow="Partner Signup">
        <form action={signupAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="fullName">
              Full Name
            </label>
            <input className="field" id="fullName" name="fullName" required />
          </div>
          <div>
            <label className="label" htmlFor="companyName">
              Company
            </label>
            <input className="field" id="companyName" name="companyName" required />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Work Email
            </label>
            <input className="field" id="email" name="email" type="email" required />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Use the login screen if this email already has workspace access.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="field"
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="label" htmlFor="partnerCode">
              Partner Code
            </label>
            <input
              className="field"
              id="partnerCode"
              name="partnerCode"
              placeholder="Optional: join an existing partner workspace"
            />
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <SubmitButton
            label="Create Partner Workspace"
            pendingLabel="Provisioning..."
            className="w-full"
          />
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already have access?{" "}
          <Link href="/login" className="font-semibold text-ink">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
