import type { ReactNode } from "react";

import { cn, titleCase } from "@/lib/utils";

type BadgeProps = {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  const tones = {
    neutral: "bg-[rgba(17,24,39,0.08)] text-slate-700",
    success: "bg-[rgba(5,150,105,0.12)] text-emerald-700",
    warning: "bg-[rgba(217,119,6,0.12)] text-amber-800",
    danger: "bg-[rgba(190,24,93,0.12)] text-rose-800",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        tones[tone],
      )}
    >
      {typeof children === "string" ? titleCase(children) : children}
    </span>
  );
}
