type MetricBarProps = {
  label: string;
  value: string;
  percentage: number;
};

export function MetricBar({ label, value, percentage }: MetricBarProps) {
  return (
    <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/72 px-4 py-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-ink">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[rgba(15,118,110,0.08)]">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#0f766e,#b45309)]"
          style={{ width: `${Math.max(6, Math.min(percentage, 100))}%` }}
        />
      </div>
    </div>
  );
}
