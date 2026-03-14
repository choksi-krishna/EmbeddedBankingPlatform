import { DashboardHeader } from "@/components/dashboard/header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { issueCardAction } from "@/app/(dashboard)/actions";
import { requireViewer } from "@/lib/require-viewer";
import { listAccounts, listCards, listUsers } from "@/lib/services/platform";
import { formatDate, formatMoney, maskAccount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const viewer = await requireViewer();
  const [cards, accounts, users] = await Promise.all([
    listCards(viewer),
    listAccounts(viewer),
    listUsers(viewer),
  ]);
  const activeCards = cards.filter((card) => card.status === "active").length;

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="Card Management"
          description="Issue virtual cards tied to treasury or wallet accounts, set spend controls, and monitor card status."
        />

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cards issued
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{cards.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active cards
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{activeCards}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Issued Cards" eyebrow="Virtual Cards" className="2xl:col-span-8">
          <DataTable
            rows={cards}
            columns={[
              {
                header: "Cardholder",
                cell: (card) => (
                  <div>
                    <p className="font-medium text-ink">{card.cardholderName}</p>
                    <p className="text-xs text-slate-500">{card.brand}</p>
                  </div>
                ),
              },
              {
                header: "Account",
                cell: (card) =>
                  maskAccount(
                    accounts.find((account) => account.account.id === card.accountId)?.account
                      .accountNumber ?? card.accountId,
                  ),
              },
              {
                header: "Limit",
                cell: (card) => formatMoney(card.spendingLimit),
              },
              {
                header: "Status",
                cell: (card) => (
                  <Badge tone={card.status === "active" ? "success" : "warning"}>
                    {card.status}
                  </Badge>
                ),
              },
              {
                header: "Issued",
                cell: (card) => formatDate(card.createdAt),
              },
            ]}
          />
        </Card>

        <Card title="Issue Virtual Card" eyebrow="Provisioning" className="2xl:col-span-4">
          <form action={issueCardAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="userId">
                Cardholder
              </label>
              <select className="field" id="userId" name="userId" required>
                {users
                  .filter((user) => !viewer.partnerId || user.partnerId === viewer.partnerId)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="accountId">
                Funding Account
              </label>
              <select className="field" id="accountId" name="accountId" required>
                {accounts.map(({ account }) => (
                  <option key={account.id} value={account.id}>
                    {account.nickname} · {maskAccount(account.accountNumber)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="cardholderName">
                Embossed Name
              </label>
              <input className="field" id="cardholderName" name="cardholderName" required />
            </div>
            <div>
              <label className="label" htmlFor="spendingLimit">
                Spending Limit
              </label>
              <input className="field" id="spendingLimit" name="spendingLimit" type="number" min="100" step="1" required />
            </div>
            <SubmitButton label="Issue Card" pendingLabel="Issuing..." />
          </form>
        </Card>
      </div>
    </div>
  );
}
