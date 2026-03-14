import { DashboardHeader } from "@/components/dashboard/header";
import { MetricBar } from "@/components/dashboard/metric-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { requireViewer } from "@/lib/require-viewer";
import { getAnalytics } from "@/lib/services/platform";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const viewer = await requireViewer();
  const analytics = await getAnalytics(viewer);

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="Analytics Dashboard"
          description="Operational metrics for liquidity, transfer volume, compliance throughput, and embedded issuance activity."
        />

        <Card>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Monthly transfer volume
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {formatMoney(analytics.monthlyTransferVolume)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Compliance load
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {analytics.flaggedCompliance}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-12">
        <StatCard
          className="h-full 2xl:col-span-4"
          label="Total Balance"
          value={formatMoney(analytics.totalBalance)}
          helper="Visible available balance across tenant accounts"
        />
        <StatCard
          className="h-full 2xl:col-span-3"
          label="Net Flow"
          value={formatMoney(analytics.netFlow)}
          helper="Credits minus debits in current ledger snapshot"
        />
        <StatCard
          className="h-full 2xl:col-span-2"
          label="Active Accounts"
          value={String(analytics.activeAccounts)}
          helper="Accounts currently in active status"
        />
        <StatCard
          className="h-full 2xl:col-span-3"
          label="Active Cards"
          value={String(analytics.activeCards)}
          helper="Virtual cards available for spend"
        />
      </div>

      <Card title="Operational Mix" eyebrow="Performance">
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
          <MetricBar
            label="Transfer volume"
            value={formatMoney(analytics.monthlyTransferVolume)}
            percentage={Math.min(100, analytics.monthlyTransferVolume / 2000)}
          />
          <MetricBar
            label="Pending KYC"
            value={`${analytics.pendingKyc} cases`}
            percentage={analytics.pendingKyc * 18}
          />
          <MetricBar
            label="Compliance alerts"
            value={`${analytics.flaggedCompliance} records`}
            percentage={analytics.flaggedCompliance * 25}
          />
          <MetricBar
            label="Card issuance"
            value={`${analytics.activeCards} active cards`}
            percentage={analytics.activeCards * 24}
          />
        </div>
      </Card>
    </div>
  );
}
