function LoadingBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-[28px] bg-slate-200/70 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8 2xl:px-10 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-8">
      <aside className="panel-surface flex h-fit flex-col gap-5 p-6 xl:p-7">
        <LoadingBlock className="h-4 w-28 rounded-full" />
        <LoadingBlock className="h-20 w-full" />
        <LoadingBlock className="h-32 w-full" />
        <LoadingBlock className="h-28 w-full" />
        <LoadingBlock className="h-24 w-full" />
      </aside>

      <div className="min-w-0 space-y-6 xl:space-y-8">
        <section className="panel-surface px-5 py-5 lg:px-6">
          <div className="space-y-4">
            <LoadingBlock className="h-3 w-24 rounded-full" />
            <LoadingBlock className="h-10 w-72" />
            <LoadingBlock className="h-5 w-full max-w-2xl" />
            <div className="grid gap-3 md:grid-cols-3">
              <LoadingBlock className="h-24 w-full" />
              <LoadingBlock className="h-24 w-full" />
              <LoadingBlock className="h-24 w-full" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <LoadingBlock className="h-32 w-full" />
          <LoadingBlock className="h-32 w-full" />
          <LoadingBlock className="h-32 w-full" />
          <LoadingBlock className="h-32 w-full" />
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
          <LoadingBlock className="h-[420px] w-full xl:col-span-8" />
          <LoadingBlock className="h-[420px] w-full xl:col-span-4" />
        </section>
      </div>
    </main>
  );
}
