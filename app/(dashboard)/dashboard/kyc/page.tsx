import { DashboardHeader } from "@/components/dashboard/header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { uploadKycAction } from "@/app/(dashboard)/actions";
import { requireViewer } from "@/lib/require-viewer";
import { listKycDocuments, listUsers } from "@/lib/services/platform";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  const viewer = await requireViewer();
  const [documents, users] = await Promise.all([
    listKycDocuments(viewer),
    listUsers(viewer),
  ]);
  const pendingDocuments = documents.filter((document) => document.status === "pending").length;

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="KYC Verification"
          description="Upload identity and business formation documents, then route them into the compliance review queue."
        />

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Documents
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{documents.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Pending review
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{pendingDocuments}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Document Queue" eyebrow="Verification" className="2xl:col-span-8">
          <DataTable
            rows={documents}
            columns={[
              {
                header: "Document",
                cell: (document) => (
                  <div>
                    <p className="font-medium text-ink">{document.fileName}</p>
                    <p className="text-xs text-slate-500">{document.documentType}</p>
                  </div>
                ),
              },
              {
                header: "Owner",
                cell: (document) =>
                  users.find((user) => user.id === document.userId)?.fullName ?? document.userId,
              },
              {
                header: "Status",
                cell: (document) => (
                  <Badge
                    tone={
                      document.status === "approved"
                        ? "success"
                        : document.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {document.status}
                  </Badge>
                ),
              },
              {
                header: "Uploaded",
                cell: (document) => formatDate(document.uploadedAt),
              },
            ]}
          />
        </Card>

        <Card title="Upload KYC Document" eyebrow="Intake" className="2xl:col-span-4">
          <form action={uploadKycAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="userId">
                Subject
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
              <label className="label" htmlFor="documentType">
                Document Type
              </label>
              <select className="field" id="documentType" name="documentType">
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver&apos;s License</option>
                <option value="business_registration">Business Registration</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="document">
                File
              </label>
              <input className="field" id="document" name="document" type="file" />
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea className="field min-h-28" id="notes" name="notes" />
            </div>
            <SubmitButton label="Upload Document" pendingLabel="Uploading..." />
          </form>
        </Card>
      </div>
    </div>
  );
}
