import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewer } from "@/lib/services/platform";

const ctaClass =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition";

const apiExample = `curl -X POST /api/transfers \\
  -H "Authorization: Bearer baas.orbitdemo01.secret123" \\
  -H "Content-Type: application/json" \\
  -d '{"sourceAccountId":"acct-orbit-operating","destinationAccountId":"acct-orbit-wallet","amount":1250,"currency":"USD","rail":"ach"}'`;

export default async function HomePage() {
  const viewer = await getViewer();
  const isAuthenticated = isSupabaseConfigured && Boolean(viewer);
  const isMockMode = !isSupabaseConfigured;
  const featureCards = [
    {
      href: "/dashboard/accounts",
      title: "Accounts",
      copy: "Open operating or wallet accounts, inspect balances, and create new ledgers.",
    },
    {
      href: "/dashboard/transactions",
      title: "Transfers",
      copy: "Move money, review posted activity, and keep rails visible from one screen.",
    },
    {
      href: "/dashboard/cards",
      title: "Cards",
      copy: "Issue spend instruments with account-aware limits and cardholder context.",
    },
    {
      href: "/dashboard/compliance",
      title: "Compliance",
      copy: "Keep KYC, AML, and restricted records in a workspace that risk teams can actually use.",
    },
    {
      href: "/dashboard/api-keys",
      title: "Developer Access",
      copy: "Manage keys and webhook destinations without digging through operational views.",
    },
    {
      href: "/dashboard/analytics",
      title: "Analytics",
      copy: "Track liquidity, throughput, alerts, and platform utilization in one place.",
    },
  ];
  const operatorFlows = [
    "Review balances and account posture before moving money.",
    "Initiate transfers, then confirm ledger and webhook delivery in context.",
    "Handle KYC and compliance queues without leaving the workspace.",
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 2xl:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white/80 font-display text-xl font-semibold text-ink shadow-[0_12px_30px_rgba(17,24,39,0.08)]">
            E
          </span>
          <span>
            <span className="block font-display text-2xl font-semibold text-ink">
              EmbeddyFi
            </span>
            <span className="block text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">
              Embedded banking platform
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-ink"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-[rgba(17,24,39,0.08)] bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
          >
            Create workspace
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Open workspace
          </Link>
        </div>
      </div>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="panel-surface relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.18),transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.16),transparent_62%)]" />
          <div className="relative space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="success">
                {isAuthenticated
                  ? "Authenticated session"
                  : isMockMode
                    ? "Mock sandbox mode"
                    : "Live platform mode"}
              </Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Platform overview
              </span>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-6">
                <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] text-ink md:text-6xl xl:text-7xl">
                  Embedded banking for teams that need control, visibility, and speed.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-600">
                  Run accounts, transfers, cards, KYC, compliance, webhooks, and
                  partner operations from one workspace built for daily banking work.
                </p>

                {isAuthenticated ? (
                  <Card className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Active operator
                    </p>
                    <p className="mt-3 text-lg font-semibold text-ink">{viewer?.email}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Your session is live. Head straight into the workspace and pick
                      up where you left off.
                    </p>
                  </Card>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard" className={`${ctaClass} bg-ink text-white hover:bg-ink/90`}>
                    Open Workspace
                  </Link>
                  <Link
                    href="/signup"
                    className={`${ctaClass} border border-[rgba(17,24,39,0.1)] bg-white/80 text-ink hover:bg-white`}
                  >
                    Create Workspace
                  </Link>
                  {!isAuthenticated && !isMockMode ? (
                    <Link href="/login" className={`${ctaClass} bg-tide text-white hover:bg-tide/90`}>
                      Sign In
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[28px] bg-ink px-5 py-6 text-white shadow-[0_28px_70px_rgba(9,17,31,0.24)]">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/55">
                    Workspace at a glance
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    Built for operators
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    Monitor activity, move money, review risk, and manage
                    integrations without switching tools.
                  </p>
                </div>
                {[
                  {
                    label: "Accounts",
                    value: "Balances, provisioning, and ownership",
                  },
                  {
                    label: "Transfers",
                    value: "Payments, ledger activity, and settlement",
                  },
                  {
                    label: "Compliance",
                    value: "KYC review, monitoring, and controls",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/72 px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm text-ink">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card eyebrow="Operator Journey" title="A friendlier flow for real tasks">
          <div className="space-y-4">
            {operatorFlows.map((flow, index) => (
              <div
                key={flow}
                className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/80 px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-600">{flow}</p>
                </div>
              </div>
            ))}

            <div className="rounded-[24px] bg-[rgba(15,118,110,0.08)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                API example
              </p>
              <pre className="mt-3 overflow-x-auto rounded-[20px] bg-ink p-4 font-mono text-xs leading-6 text-white">
                <code>{apiExample}</code>
              </pre>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(17,24,39,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Product area
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
              <p className="mt-6 text-sm font-semibold text-tide">Open workspace</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card eyebrow="Why Teams Use It" title="A banking workspace that stays operational">
          <div className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Treasury, risk, and platform teams need the same thing from software:
              reliable access to the data and actions that matter every day.
            </p>
            <p>
              This workspace keeps the core operational jobs close together so teams
              can review balances, move funds, monitor risk, and manage integrations
              without friction.
            </p>
          </div>
        </Card>

        <Card eyebrow="Coverage" title="Built for the teams that touch money">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Treasury operators managing balances and transfers",
              "Risk teams monitoring KYC and restricted cases",
              "Developers handling API keys and webhook delivery",
              "Partner admins inviting users and reviewing tenant posture",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/76 px-4 py-4 text-sm leading-6 text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
