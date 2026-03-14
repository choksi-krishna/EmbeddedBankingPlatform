import { DashboardHeader } from "@/components/dashboard/header";
import { ApiKeyCreator } from "@/components/forms/api-key-creator";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  createApiKeyAction,
  registerWebhookAction,
} from "@/app/(dashboard)/actions";
import { requireViewer } from "@/lib/require-viewer";
import { listApiKeys, listWebhooks } from "@/lib/services/platform";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const viewer = await requireViewer();
  const [apiKeys, webhooks] = await Promise.all([
    listApiKeys(viewer),
    listWebhooks(viewer),
  ]);

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="API Keys & Webhooks"
          description="Manage partner credentials for outbound API access and register webhook destinations for real-time banking events."
        />

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active keys
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{apiKeys.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Webhook endpoints
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{webhooks.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Active API Keys" eyebrow="Integrations" className="2xl:col-span-8">
          <DataTable
            rows={apiKeys}
            columns={[
              {
                header: "Name",
                cell: (key) => (
                  <div>
                    <p className="font-medium text-ink">{key.name}</p>
                    <p className="font-mono text-xs text-slate-500">{key.prefix}</p>
                  </div>
                ),
              },
              {
                header: "Permissions",
                cell: (key) => (
                  <div className="max-w-xs text-xs leading-6 text-slate-500">
                    {key.permissions.join(", ")}
                  </div>
                ),
              },
              {
                header: "Status",
                cell: (key) => (
                  <Badge tone={key.status === "active" ? "success" : "danger"}>
                    {key.status}
                  </Badge>
                ),
              },
              {
                header: "Created",
                cell: (key) => formatDate(key.createdAt),
              },
            ]}
          />
        </Card>

        <Card title="Create API Key" eyebrow="Credentials" className="2xl:col-span-4">
          <ApiKeyCreator action={createApiKeyAction} />
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Webhook Endpoints" eyebrow="Event Delivery" className="2xl:col-span-8">
          <DataTable
            rows={webhooks}
            columns={[
              {
                header: "URL",
                cell: (webhook) => (
                  <div className="max-w-sm break-all text-slate-600">{webhook.url}</div>
                ),
              },
              {
                header: "Events",
                cell: (webhook) => (
                  <div className="max-w-xs text-xs leading-6 text-slate-500">
                    {webhook.events.join(", ")}
                  </div>
                ),
              },
              {
                header: "Status",
                cell: (webhook) => (
                  <Badge tone={webhook.status === "active" ? "success" : "warning"}>
                    {webhook.status}
                  </Badge>
                ),
              },
              {
                header: "Last Delivery",
                cell: (webhook) => formatDate(webhook.lastDeliveryAt),
              },
            ]}
          />
        </Card>

        <Card title="Register Webhook" eyebrow="Delivery" className="2xl:col-span-4">
          <form action={registerWebhookAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="url">
                Endpoint URL
              </label>
              <input className="field" id="url" name="url" type="url" required />
            </div>
            <div>
              <label className="label" htmlFor="events">
                Events
              </label>
              <input
                className="field"
                id="events"
                name="events"
                placeholder="transfer.settled, card.issued, kyc.updated"
                required
              />
            </div>
            <SubmitButton label="Register Webhook" pendingLabel="Saving..." />
          </form>
        </Card>
      </div>
    </div>
  );
}
