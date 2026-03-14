import Link from "next/link";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";

import { loginAction, magicLinkAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await redirectIfAuthenticated();

  const params = await searchParams;
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;
  const message =
    typeof params.message === "string" ? decodeURIComponent(params.message) : null;

  return (
    <main className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-8 2xl:px-10">
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
                Partner access
              </span>
            </span>
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-[rgba(17,24,39,0.08)] bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
          >
            Create workspace
          </Link>
        </div>
      </div>

      <div className="panel-surface relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-y-0 right-0 w-52 bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.18),transparent_72%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.16),transparent_64%)]" />
        <div className="relative space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-tide">
            Partner access
          </p>
          <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[0.96] text-ink">
            Sign in to your banking workspace.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Accounts, transfers, cards, compliance, and developer access now sit under
            one clearer dashboard path, so the product is easier to move through once
            you are signed in.
          </p>

          {!isSupabaseConfigured ? (
            <Card className="max-w-2xl">
              <p className="text-sm leading-6 text-slate-600">
                Backend environment variables are not configured. The app will run in
                sandbox mode with seeded tenant data, so you can still open the
                workspace and validate the route flow locally.
              </p>
            </Card>
          ) : null}
        </div>
      </div>

      <Card title="Login" eyebrow="Auth">
        <form action={loginAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input className="field" id="email" name="email" type="email" required />
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
            />
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <SubmitButton label="Sign In" pendingLabel="Signing in..." className="w-full" />
        </form>
        {isSupabaseConfigured ? (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              Prefer passwordless access? Request a magic link instead.
            </p>
            <form action={magicLinkAction} className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="magicLinkEmail">
                  Magic Link Email
                </label>
                <input
                  className="field"
                  id="magicLinkEmail"
                  name="email"
                  type="email"
                  required
                />
              </div>
              <SubmitButton
                label="Send Magic Link"
                pendingLabel="Sending..."
                className="w-full"
              />
            </form>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-slate-500">
          Need a workspace?{" "}
          <Link href="/signup" className="font-semibold text-ink">
            Create a partner account
          </Link>
        </p>
      </Card>
    </main>
  );
}
