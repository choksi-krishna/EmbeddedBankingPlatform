import Link from "next/link";

import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[1600px] items-center px-4 py-10 sm:px-6 lg:px-8 2xl:px-10">
      <Card className="w-full max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Not found
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-none text-ink">
          That route does not exist in this workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Use the normalized dashboard routes or return to the platform landing page.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Open workspace
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-full border border-[rgba(17,24,39,0.08)] bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Return home
          </Link>
        </div>
      </Card>
    </main>
  );
}
