import { DashboardHeader } from "@/components/dashboard/header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { createAccountAction } from "@/app/(dashboard)/actions";
import { requireViewer } from "@/lib/require-viewer";
import { listAccounts, listUsers } from "@/lib/services/platform";
import { formatDate, formatMoney, maskAccount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const viewer = await requireViewer();
  const [accounts, users] = await Promise.all([
    listAccounts(viewer),
    listUsers(viewer),
  ]);
  const activeAccounts = accounts.filter(({ account }) => account.status === "active").length;

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="Accounts Management"
          description="Provision partner operating and wallet accounts, view routing details, and monitor balances for each tenant account."
        />

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Visible accounts
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{accounts.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active accounts
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{activeAccounts}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Accounts" eyebrow="Banking Ledger" className="2xl:col-span-8">
          <DataTable
            rows={accounts}
            columns={[
              {
                header: "Nickname",
                cell: ({ account, owner }) => (
                  <div>
                    <p className="font-medium text-ink">{account.nickname}</p>
                    <p className="text-xs text-slate-500">{owner?.fullName ?? "Unknown owner"}</p>
                  </div>
                ),
              },
              {
                header: "Details",
                cell: ({ account }) => (
                  <div>
                    <p>{maskAccount(account.accountNumber)}</p>
                    <p className="text-xs text-slate-500">{account.routingNumber}</p>
                  </div>
                ),
              },
              {
                header: "Balance",
                cell: ({ balance }) => (
                  <div>
                    <p className="font-semibold text-ink">
                      {formatMoney(balance?.available ?? 0)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Ledger {formatMoney(balance?.ledger ?? 0)}
                    </p>
                  </div>
                ),
              },
              {
                header: "Status",
                cell: ({ account }) => (
                  <Badge tone={account.status === "active" ? "success" : "warning"}>
                    {account.status}
                  </Badge>
                ),
              },
              {
                header: "Opened",
                cell: ({ account }) => formatDate(account.createdAt),
              },
            ]}
          />
        </Card>

        <Card title="Create Account" eyebrow="Onboarding" className="2xl:col-span-4">
          {viewer.partnerId ? (
            <form action={createAccountAction} className="space-y-4">
              <div>
                <label className="label" htmlFor="userId">
                  Owner
                </label>
                <select className="field" name="userId" id="userId" required>
                  {users
                    .filter((user) => user.partnerId === viewer.partnerId)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="nickname">
                  Nickname
                </label>
                <input className="field" id="nickname" name="nickname" required />
              </div>
              <div>
                <label className="label" htmlFor="type">
                  Account Type
                </label>
                <select className="field" name="type" id="type">
                  <option value="operating">Operating</option>
                  <option value="wallet">Wallet</option>
                  <option value="reserve">Reserve</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="currency">
                  Currency
                </label>
                <input className="field" id="currency" name="currency" defaultValue="USD" />
              </div>
              <SubmitButton label="Provision Account" pendingLabel="Creating..." />
            </form>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Switch to a partner-scoped user to create accounts. Platform admins can
              still review all tenant accounts from this view.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
