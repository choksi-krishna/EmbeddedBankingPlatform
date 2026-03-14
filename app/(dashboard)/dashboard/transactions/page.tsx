import { DashboardHeader } from "@/components/dashboard/header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { createTransferAction } from "@/app/(dashboard)/actions";
import { requireViewer } from "@/lib/require-viewer";
import {
  listAccounts,
  listTransactions,
  listTransfers,
} from "@/lib/services/platform";
import { formatDate, formatMoney, maskAccount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const viewer = await requireViewer();
  const [accounts, transactions, transfers] = await Promise.all([
    listAccounts(viewer),
    listTransactions(viewer),
    listTransfers(viewer),
  ]);
  const settledTransfers = transfers.filter((transfer) => transfer.status === "settled").length;

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="Transactions & Transfers"
          description="Review posted ledger activity and originate ACH or book transfers between managed accounts."
        />

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Posted transactions
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{transactions.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Settled transfers
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{settledTransfers}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Transfers" eyebrow="ACH Rail" className="2xl:col-span-8">
          <DataTable
            rows={transfers}
            columns={[
              {
                header: "Reference",
                cell: (transfer) => (
                  <div>
                    <p className="font-medium text-ink">{transfer.id}</p>
                    <p className="text-xs text-slate-500">
                      {transfer.externalReference || "No external reference"}
                    </p>
                  </div>
                ),
              },
              {
                header: "Amount",
                cell: (transfer) => formatMoney(transfer.amount, transfer.currency),
              },
              {
                header: "Rail",
                cell: (transfer) => transfer.rail.toUpperCase(),
              },
              {
                header: "Status",
                cell: (transfer) => (
                  <Badge
                    tone={
                      transfer.status === "settled"
                        ? "success"
                        : transfer.status === "failed"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {transfer.status}
                  </Badge>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Initiate Transfer" eyebrow="Move Funds" className="2xl:col-span-4">
          <form action={createTransferAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="sourceAccountId">
                Source Account
              </label>
              <select className="field" id="sourceAccountId" name="sourceAccountId" required>
                {accounts.map(({ account }) => (
                  <option key={account.id} value={account.id}>
                    {account.nickname} · {maskAccount(account.accountNumber)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="destinationAccountId">
                Destination Account
              </label>
              <select
                className="field"
                id="destinationAccountId"
                name="destinationAccountId"
                required
              >
                {accounts.map(({ account }) => (
                  <option key={account.id} value={account.id}>
                    {account.nickname} · {maskAccount(account.accountNumber)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label" htmlFor="amount">
                  Amount
                </label>
                <input
                  className="field"
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="rail">
                  Rail
                </label>
                <select className="field" id="rail" name="rail">
                  <option value="ach">ACH</option>
                  <option value="book">Book</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="externalReference">
                External Reference
              </label>
              <input className="field" id="externalReference" name="externalReference" />
            </div>
            <input type="hidden" name="currency" value="USD" />
            <SubmitButton label="Create Transfer" pendingLabel="Submitting..." />
          </form>
        </Card>
      </div>

      <Card title="Transaction History" eyebrow="Ledger">
        <DataTable
          rows={transactions}
          columns={[
            {
              header: "Description",
              cell: (transaction) => (
                <div>
                  <p className="font-medium text-ink">{transaction.description}</p>
                  <p className="text-xs text-slate-500">{transaction.counterparty}</p>
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
              cell: (transaction) => formatMoney(transaction.amount, transaction.currency),
            },
            {
              header: "Posted",
              cell: (transaction) => formatDate(transaction.postedAt),
            },
          ]}
        />
      </Card>
    </div>
  );
}
