import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard/header";
import { MetricBar } from "@/components/dashboard/metric-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { requireViewer } from "@/lib/require-viewer";
import { getDashboardSnapshot } from "@/lib/services/platform";
import { formatDate, formatMoney, maskAccount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot(viewer);
  const message =
    typeof params.message === "string" ? decodeURIComponent(params.message) : null;
  const partnerName = snapshot.partner?.name ?? "Platform-wide view";
  const partnerTier = snapshot.partner?.tier ?? "enterprise";
  const platformCoverage = [
    {
      label: "API keys",
      value: snapshot.apiKeys.length,
      helper: "Scoped partner credentials",
    },
    {
      label: "Webhook endpoints",
      value: snapshot.webhooks.length,
      helper: "Realtime delivery destinations",
    },
    {
      label: "Virtual cards",
      value: snapshot.cards.length,
      helper: "Issued spending instruments",
    },
    {
      label: "KYC documents",
      value: snapshot.documents.length,
      helper: "Uploaded verification records",
    },
  ];
  const controlPlaneModules = [
    {
      href: "/dashboard/accounts",
      label: "Accounts",
      helper: "Provision operating and wallet ledgers",
    },
    {
      href: "/dashboard/transactions",
      label: "Transfers",
      helper: "Create and review money movement",
    },
    {
      href: "/dashboard/cards",
      label: "Cards",
      helper: "Issue virtual cards with limits",
    },
    {
      href: "/dashboard/kyc",
      label: "KYC",
      helper: "Upload and review verification documents",
    },
    {
      href: "/dashboard/compliance",
      label: "Compliance",
      helper: "Watch risk cases and restrictions",
    },
    {
      href: "/dashboard/api-keys",
      label: "Webhooks",
      helper: "Manage keys and delivery endpoints",
    },
  ];

  return (
    <div className="space-y-6 xl:space-y-8">
      {message ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          {message}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="relative overflow-hidden xl:col-span-8">
          <div className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.16),transparent_68%)]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.16),transparent_60%)]" />
          <div className="relative space-y-8">
            <DashboardHeader
              title="Mission Control"
              description="Monitor balances, transfers, KYC queues, compliance exceptions, and developer connectivity from a single operational workspace."
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {controlPlaneModules.map((module) => (
                    <Link
                      key={module.href}
                      href={module.href}
                      prefetch
                      className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/75 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-ink">{module.label}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {module.helper}
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="rounded-[28px] border border-[rgba(17,24,39,0.08)] bg-mist px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    API Surface
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Route handlers are live for auth, users, accounts, transactions,
                    transfers, cards, KYC, partners, analytics, and webhook delivery
                    flows.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[28px] bg-ink px-5 py-5 text-white shadow-[0_24px_60px_rgba(9,17,31,0.22)]">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                    Tenant scope
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{partnerName}</p>
                  <p className="mt-2 text-sm text-white/70">
                    Multi-tenant operator view for balances, user management,
                    compliance throughput, and developer integrations.
                  </p>
                  <div className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                    {partnerTier}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/80 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Team footprint
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {snapshot.users.length} users
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/80 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Integration reach
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {snapshot.webhooks.length} webhooks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden xl:col-span-4">
          <div className="absolute inset-y-0 right-0 w-28 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.18),transparent_68%)]" />
          <div className="relative space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Workspace Scope
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {partnerName}
                </p>
              </div>
              <Badge tone="neutral">{partnerTier}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Accounts
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {snapshot.accounts.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Transfers
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {snapshot.transfers.length}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-[rgba(17,24,39,0.08)] bg-white/75 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Compliance posture
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {snapshot.analytics.pendingKyc} documents in review and{" "}
                {snapshot.analytics.flaggedCompliance} records currently outside clear
                status.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <StatCard
          className="h-full"
          label="Available Balance"
          value={formatMoney(snapshot.analytics.totalBalance)}
          helper="Across visible partner accounts"
        />
        <StatCard
          className="h-full"
          label="Monthly Transfer Volume"
          value={formatMoney(snapshot.analytics.monthlyTransferVolume)}
          helper="ACH and internal book transfers"
        />
        <StatCard
          className="h-full"
          label="Pending KYC"
          value={String(snapshot.analytics.pendingKyc)}
          helper="Documents requiring review"
        />
        <StatCard
          className="h-full"
          label="Flagged Compliance"
          value={String(snapshot.analytics.flaggedCompliance)}
          helper="Records in monitor or restricted status"
        />
        <StatCard
          className="h-full"
          label="Active Accounts"
          value={String(snapshot.analytics.activeAccounts)}
          helper="Live tenant accounts in circulation"
        />
        <StatCard
          className="h-full"
          label="Active Cards"
          value={String(snapshot.analytics.activeCards)}
          helper="Issued virtual cards available for spend"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Recent Transactions" eyebrow="Ledger" className="xl:col-span-7">
          <DataTable
            rows={snapshot.transactions.slice(0, 5)}
            columns={[
              {
                header: "Account",
                cell: (transaction) => (
                  <div className="space-y-1">
                    <p className="font-medium text-ink">
                      {maskAccount(
                        snapshot.accounts.find(
                          (entry) => entry.account.id === transaction.accountId,
                        )?.account.accountNumber ?? transaction.accountId,
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{transaction.description}</p>
                  </div>
                ),
              },
              {
                header: "Direction",
                cell: (transaction) => (
                  <Badge tone={transaction.direction === "credit" ? "success" : "warning"}>
                    {transaction.direction}
                  </Badge>
                ),
              },
              {
                header: "Amount",
                cell: (transaction) => (
                  <span className="font-semibold text-ink">
                    {formatMoney(transaction.amount)}
                  </span>
                ),
              },
              {
                header: "Posted",
                cell: (transaction) => formatDate(transaction.postedAt),
              },
            ]}
          />
        </Card>

        <Card title="Operational Pressure" eyebrow="Analytics" className="xl:col-span-5">
          <div className="space-y-4">
            <MetricBar
              label="KYC queue"
              value={`${snapshot.analytics.pendingKyc} pending`}
              percentage={snapshot.analytics.pendingKyc * 20}
            />
            <MetricBar
              label="Active cards"
              value={`${snapshot.analytics.activeCards} issued`}
              percentage={snapshot.analytics.activeCards * 25}
            />
            <MetricBar
              label="Flagged compliance"
              value={`${snapshot.analytics.flaggedCompliance} alerts`}
              percentage={snapshot.analytics.flaggedCompliance * 30}
            />
            <MetricBar
              label="Active accounts"
              value={`${snapshot.analytics.activeAccounts} live`}
              percentage={snapshot.analytics.activeAccounts * 24}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Notifications" eyebrow="Realtime" className="xl:col-span-7">
          <div className="space-y-3">
            {snapshot.notifications.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-[rgba(17,24,39,0.08)] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink">{item.title}</p>
                  <Badge
                    tone={
                      item.severity === "critical"
                        ? "danger"
                        : item.severity === "warning"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {item.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Platform Coverage" eyebrow="Integrations" className="xl:col-span-5">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="grid gap-3 sm:grid-cols-2">
              {platformCoverage.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-[rgba(17,24,39,0.08)] px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{item.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.helper}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[28px] bg-mist px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Developer APIs
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                `/api/auth`, `/api/users`, `/api/accounts`, `/api/transactions`,
                `/api/transfers`, `/api/cards`, `/api/kyc`, `/api/webhooks`,
                `/api/partners`, and `/api/analytics` are mapped for partner
                integrations.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
