import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  accent?: ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  helper,
  accent,
  className,
}: StatCardProps) {
  return (
    <Card className={`min-w-0 overflow-hidden ${className ?? ""}`}>
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
          <p className="mt-4 break-words font-display text-[clamp(2rem,2.6vw,3rem)] font-semibold leading-[0.92] text-ink">
            {value}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">{helper}</p>
        </div>
        {accent}
      </div>
    </Card>
  );
}
