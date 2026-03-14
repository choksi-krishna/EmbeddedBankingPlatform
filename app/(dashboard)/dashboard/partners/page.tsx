import { DashboardHeader } from "@/components/dashboard/header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { inviteUserAction } from "@/app/(dashboard)/actions";
import { requireViewer } from "@/lib/require-viewer";
import {
  listPartners,
  listUsers,
} from "@/lib/services/platform";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const viewer = await requireViewer();
  const [partners, users] = await Promise.all([
    listPartners(viewer),
    listUsers(viewer),
  ]);

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="Partners & User Management"
          description="Review partner tenants, their onboarding state, and invite operational users into the banking workspace."
        />

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Partner tenants
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{partners.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Users
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{users.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Partners" eyebrow="Tenants" className="2xl:col-span-8">
          <DataTable
            rows={partners}
            columns={[
              {
                header: "Name",
                cell: (partner) => (
                  <div>
                    <p className="font-medium text-ink">{partner.name}</p>
                    <p className="text-xs text-slate-500">{partner.slug}</p>
                  </div>
                ),
              },
              {
                header: "Tier",
                cell: (partner) => partner.tier,
              },
              {
                header: "Status",
                cell: (partner) => (
                  <Badge tone={partner.status === "active" ? "success" : "warning"}>
                    {partner.status}
                  </Badge>
                ),
              },
              {
                header: "Created",
                cell: (partner) => formatDate(partner.createdAt),
              },
            ]}
          />
        </Card>

        <Card title="Invite Team Member" eyebrow="User Management" className="2xl:col-span-4">
          {viewer.partnerId ? (
            <form action={inviteUserAction} className="space-y-4">
              <div>
                <label className="label" htmlFor="fullName">
                  Full Name
                </label>
                <input className="field" id="fullName" name="fullName" required />
              </div>
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input className="field" id="email" name="email" type="email" required />
              </div>
              <div>
                <label className="label" htmlFor="role">
                  Role
                </label>
                <select className="field" id="role" name="role">
                  <option value="partner_admin">Partner Admin</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <SubmitButton label="Send Invite" pendingLabel="Sending..." />
            </form>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Platform admins can review all partner users here. Switch into a
              partner-scoped session to invite team members.
            </p>
          )}
        </Card>
      </div>

      <Card title="Users" eyebrow="Access">
        <DataTable
          rows={users}
          columns={[
            {
              header: "Name",
              cell: (user) => (
                <div>
                  <p className="font-medium text-ink">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              ),
            },
            {
              header: "Role",
              cell: (user) => user.role,
            },
            {
              header: "Status",
              cell: (user) => (
                <Badge tone={user.status === "active" ? "success" : "warning"}>
                  {user.status}
                </Badge>
              ),
            },
            {
              header: "Created",
              cell: (user) => formatDate(user.createdAt),
            },
          ]}
        />
      </Card>
    </div>
  );
}
