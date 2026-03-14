import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { requireViewer } from "@/lib/require-viewer";
import {
  listComplianceRecords,
  listKycDocuments,
} from "@/lib/services/platform";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const viewer = await requireViewer();
  const [records, documents] = await Promise.all([
    listComplianceRecords(viewer),
    listKycDocuments(viewer),
  ]);
  const restrictedRecords = records.filter((record) => record.status === "restricted").length;

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <DashboardHeader
          title="Compliance Dashboard"
          description="Track KYC, AML, and monitoring records across tenants and focus manual review efforts where the platform is highest risk."
        />

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Compliance records
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{records.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Restricted cases
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">{restrictedRecords}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-12">
        <Card title="Compliance Records" eyebrow="Monitoring" className="2xl:col-span-8">
          <DataTable
            rows={records}
            columns={[
              {
                header: "Type",
                cell: (record) => record.type,
              },
              {
                header: "Risk Score",
                cell: (record) => (
                  <span className="font-semibold text-ink">{record.riskScore}</span>
                ),
              },
              {
                header: "Status",
                cell: (record) => (
                  <Badge
                    tone={
                      record.status === "clear"
                        ? "success"
                        : record.status === "restricted"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {record.status}
                  </Badge>
                ),
              },
              {
                header: "Notes",
                cell: (record) => (
                  <div className="max-w-sm text-slate-600">{record.notes}</div>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Review Queue Snapshot" eyebrow="KYC" className="2xl:col-span-4">
          <div className="space-y-3">
            {documents.slice(0, 5).map((document) => (
              <div key={document.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{document.fileName}</p>
                    <p className="text-xs text-slate-500">{document.documentType}</p>
                  </div>
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
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Uploaded {formatDate(document.uploadedAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
