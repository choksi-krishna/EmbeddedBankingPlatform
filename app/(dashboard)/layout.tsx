import type { ReactNode } from "react";
import Link from "next/link";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { requireViewer } from "@/lib/require-viewer";

import { logoutAction } from "../(auth)/actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await requireViewer();
  const quickLinks = [
    { href: "/dashboard/accounts", label: "Accounts" },
    { href: "/dashboard/transactions", label: "Transfers" },
    { href: "/dashboard/compliance", label: "Compliance" },
    { href: "/dashboard/api-keys", label: "Developer access" },
  ];
  const runtimeLabel =
    viewer.mode === "mock"
      ? "Mock banking sandbox with seeded data"
      : "Live tenant session";

  return (
    <main className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8 2xl:px-10 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-8">
      <div className="h-full">
        <Sidebar viewer={viewer} />
      </div>
      <div className="min-w-0 space-y-6 xl:space-y-8">
        <div className="panel-surface relative overflow-hidden px-5 py-5 lg:px-6">
          <div className="absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.14),transparent_58%)] lg:block" />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Workspace pulse
                </p>
                <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
                  Operator control room
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Track balances, move money, review compliance activity, and
                  manage developer access from one workspace.
                </p>
              </div>

              <form action={logoutAction}>
                <Button variant="ghost" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>

            <div className="grid flex-1 gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.3fr)_220px_220px]">
              <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/75 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Runtime
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{runtimeLabel}</p>
              </div>
              <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/75 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Access
                </p>
                <p className="mt-2 text-sm font-medium capitalize text-ink">
                  {viewer.role.replace("_", " ")}
                </p>
              </div>
              <div className="rounded-[24px] border border-[rgba(17,24,39,0.08)] bg-white/75 px-4 py-4 md:col-span-2 2xl:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Operator
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{viewer.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className="rounded-full border border-[rgba(17,24,39,0.08)] bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
