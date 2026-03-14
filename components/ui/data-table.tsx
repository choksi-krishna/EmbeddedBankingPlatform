import type { ReactNode } from "react";

type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
};

export function DataTable<T>({
  columns,
  rows,
  emptyLabel = "No data available.",
}: DataTableProps<T>) {
  if (!rows.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[rgba(17,24,39,0.12)] px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/78">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[rgba(17,24,39,0.08)] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.84)] text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={`px-4 py-3 ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(17,24,39,0.06)] bg-transparent">
            {rows.map((row, index) => (
              <tr key={index} className="transition hover:bg-[rgba(255,255,255,0.52)]">
                {columns.map((column) => (
                  <td key={column.header} className={`px-4 py-4 align-top ${column.className ?? ""}`}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
