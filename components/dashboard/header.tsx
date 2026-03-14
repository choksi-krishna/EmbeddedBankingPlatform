import type { ReactNode } from "react";

type DashboardHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function DashboardHeader({
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Banking workspace
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-ink xl:text-5xl">
          {title}
        </h2>
        <div className="mt-4 h-px w-16 bg-[linear-gradient(90deg,#0f766e,transparent)]" />
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500">
          {description}
        </p>
      </div>
      {actions}
    </div>
  );
}
