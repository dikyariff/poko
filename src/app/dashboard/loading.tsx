import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat halaman beranda keuangan"
      className="flex w-full flex-col gap-5 sm:gap-6"
    >
      {/* Row 1: Hero Balance Card (7 col) + Wallet Card Deck (5 col) */}
      <div className="grid gap-5 xl:grid-cols-12">
        {/* Hero Balance Card Skeleton */}
        <div className="border-ink bg-card shadow-brutal flex flex-col justify-between gap-5 rounded-[22px] border-[2.5px] p-5 sm:p-6 xl:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-36 rounded-lg" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-56 max-w-full rounded-xl sm:h-11 sm:w-64" />
            </div>
            <Skeleton className="h-11 w-32 rounded-[10px]" />
          </div>

          {/* 3-Cell Cashflow Summary Strip */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            <div className="border-ink bg-subtle/40 flex flex-col gap-2.5 rounded-2xl border-2 p-3 sm:p-3.5">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-lg" />
            </div>
            <div className="border-ink bg-subtle/40 flex flex-col gap-2.5 rounded-2xl border-2 p-3 sm:p-3.5">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-lg" />
            </div>
            <div className="border-ink bg-subtle/40 col-span-2 flex flex-col gap-2 rounded-2xl border-2 p-3 sm:col-span-1 sm:p-3.5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-5 w-11 rounded-full" />
              </div>
              <Skeleton className="h-6 w-28 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>

          {/* Monthly Spending Limit Bar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
          </div>
        </div>

        {/* Wallet Card Deck Skeleton */}
        <div className="border-ink bg-card shadow-brutal flex flex-col justify-between gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6 xl:col-span-5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-3.5 w-52 max-w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-24 shrink-0 rounded-[9px]" />
          </div>

          {/* Stacked Deck Visual Placeholder */}
          <div className="relative pt-7">
            <div className="border-ink/40 bg-subtle/50 mx-3 -mb-14 h-16 rounded-t-[18px] border-2 border-b-0" />
            <div className="border-ink bg-subtle/60 shadow-brutal-sm relative flex h-[170px] flex-col justify-between rounded-[20px] border-[2.5px] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="size-8 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-7 w-40 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="size-8 rounded-[9px]" />
              <Skeleton className="size-8 rounded-[9px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Recent Transactions (7 col) + Impian & Tabungan Preview (5 col) */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Recent Transactions Skeleton */}
        <div className="border-ink bg-card shadow-brutal flex flex-col gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-3.5 w-60 max-w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-28 rounded-[9px]" />
          </div>

          <div className="divide-ink/12 flex flex-col divide-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Skeleton className="size-11 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 max-w-[75%] rounded-md" />
                    <Skeleton className="h-3 w-52 max-w-[90%] rounded-md" />
                  </div>
                </div>
                <div className="shrink-0 space-y-1.5 text-right">
                  <Skeleton className="ml-auto h-4 w-24 rounded-md" />
                  <Skeleton className="ml-auto h-3 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impian & Tabungan Preview Skeleton */}
        <div className="border-ink bg-card shadow-brutal flex flex-col gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-3.5 w-52 max-w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-32 shrink-0 rounded-[9px]" />
          </div>

          <div className="border-ink bg-subtle/40 flex items-center justify-between gap-2 rounded-2xl border-2 px-3.5 py-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>

          <div className="flex flex-col gap-3.5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="border-ink bg-subtle/40 flex flex-col gap-2.5 rounded-2xl border-2 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Insight Poko AI Skeleton */}
      <div className="border-ink bg-card shadow-brutal flex flex-col justify-between gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-5">
        <div className="flex shrink-0 items-center gap-3.5 lg:w-[240px]">
          <Skeleton className="size-14 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>

        <div className="border-ink bg-subtle/40 flex flex-1 flex-col justify-center gap-2 rounded-2xl border-2 p-4">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-4/5 rounded-md" />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 lg:flex-col lg:items-end">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-[9px]" />
        </div>
      </div>
    </div>
  );
}
