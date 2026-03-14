"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ViewerContext } from "@/lib/types";
import { cn } from "@/lib/utils";

const navigation = [
  {
    section: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Mission Control",
        description: "Health, balance, and alert snapshot",
        token: "MC",
      },
    ],
  },
  {
    section: "Banking",
    items: [
      {
        href: "/dashboard/accounts",
        label: "Accounts",
        description: "Balances, owners, and provisioning",
        token: "AC",
      },
      {
        href: "/dashboard/transactions",
        label: "Transfers",
        description: "Ledger activity and money movement",
        token: "TR",
      },
      {
        href: "/dashboard/cards",
        label: "Cards",
        description: "Virtual issuance and spend limits",
        token: "CD",
      },
    ],
  },
  {
    section: "Risk",
    items: [
      {
        href: "/dashboard/kyc",
        label: "KYC",
        description: "Document intake and review queue",
        token: "KY",
      },
      {
        href: "/dashboard/compliance",
        label: "Compliance",
        description: "Monitoring, alerts, and restrictions",
        token: "CP",
      },
    ],
  },
  {
    section: "Platform",
    items: [
      {
        href: "/dashboard/api-keys",
        label: "Developer Access",
        description: "API keys and webhook endpoints",
        token: "API",
      },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        description: "Liquidity and throughput metrics",
        token: "AN",
      },
      {
        href: "/dashboard/partners",
        label: "Partners",
        description: "Tenants, users, and workspace access",
        token: "PT",
      },
    ],
  },
];

type SidebarProps = {
  viewer: ViewerContext;
};

export function Sidebar({ viewer }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="panel-surface [background:linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,252,251,0.96))] flex h-fit flex-col gap-6 self-start p-6 xl:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-tide">
          EmbeddyFi
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-none text-ink">
          Operator
          <br />
          Console
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
          Manage accounts, transfers, cards, compliance, and developer access
          from one workspace.
        </p>
      </div>

      <div className="rounded-[30px] bg-ink px-5 py-5 text-white shadow-[0_24px_60px_rgba(9,17,31,0.22)]">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">
          Workspace access
        </p>
        <p className="mt-2 text-lg font-semibold">{viewer.fullName}</p>
        <p className="text-sm text-white/70">{viewer.email}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {viewer.role.replace("_", " ")}
          </span>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            {viewer.mode === "supabase" ? "live" : viewer.mode}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {navigation.map((group) => (
          <div key={group.section} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {group.section}
            </p>
            <nav className="flex flex-col gap-2">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    className={cn(
                      "rounded-[24px] border px-4 py-3 transition",
                      active
                        ? "border-[rgba(15,118,110,0.16)] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.92))] shadow-[0_18px_40px_rgba(15,118,110,0.08)]"
                        : "border-transparent text-slate-500 hover:border-[rgba(17,24,39,0.06)] hover:bg-white/70 hover:text-ink",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl text-[0.72rem] font-semibold tracking-[0.18em]",
                          active
                            ? "bg-ink text-white"
                            : "bg-[rgba(17,24,39,0.06)] text-slate-500",
                        )}
                      >
                        {item.token}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
