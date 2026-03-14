import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Card({ title, eyebrow, action, className, children }: CardProps) {
  return (
    <section className={cn("panel-surface p-6 lg:p-7", className)}>
      {(title || eyebrow || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h3 className="font-display text-2xl font-semibold leading-none text-ink">
                {title}
              </h3>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
