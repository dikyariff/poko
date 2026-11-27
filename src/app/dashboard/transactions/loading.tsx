import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat halaman catatan transaksi"
      className="flex w-full flex-col gap-5 sm:gap-6"
    >
      {/* Header Aksi Skeleton */}
      <div className="border-ink bg-card shadow-brutal flex flex-wrap items-center justify-between gap-3 rounded-[22px] border-[2.5px] p-4 sm:p-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52 rounded-lg" />
          <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-11 w-full rounded-[10px] sm:w-44" />
      </div>

      {/* 4 KPI Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-ink bg-card shadow-brutal-sm flex flex-col gap-3 rounded-[18px] border-[2.5px] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-28 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="border-ink bg-card shadow-brutal flex flex-col gap-3 rounded-[22px] border-[2.5px] p-3.5 sm:p-5 md:gap-4">
        <div className="grid gap-2.5 md:grid-cols-12 md:gap-3">
          <div className="flex items-center gap-2 md:col-span-5">
            <Skeleton className="h-11 flex-1 rounded-[10px]" />
            <Skeleton className="h-11 w-22 shrink-0 rounded-[10px] md:hidden" />
          </div>
          <Skeleton className="hidden h-11 rounded-[10px] md:col-span-2 md:block" />
          <Skeleton className="hidden h-11 rounded-[10px] md:col-span-3 md:block" />
          <Skeleton className="hidden h-11 rounded-[10px] md:col-span-2 md:block" />
        </div>
        <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
          <div className="flex gap-1.5 md:gap-2">
            <Skeleton className="h-8 w-16 rounded-full md:h-9 md:w-20" />
            <Skeleton className="h-8 w-24 rounded-full md:h-9 md:w-28" />
            <Skeleton className="h-8 w-20 rounded-full md:h-9 md:w-24" />
            <Skeleton className="h-8 w-18 rounded-full md:h-9 md:w-22" />
          </div>
          <Skeleton className="h-5 w-36 rounded-full md:h-9 md:w-40" />
        </div>
      </div>

      {/* Grouped Transactions List Skeleton */}
      <div className="border-ink bg-card shadow-brutal overflow-hidden rounded-[22px] border-[2.5px]">
        <div className="border-ink bg-subtle flex items-center justify-between border-b-[2.5px] px-5 py-3">
          <Skeleton className="h-5 w-36 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="divide-ink/12 flex flex-col divide-y-2 p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3 px-2 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-44 max-w-[75%] rounded-md" />
                  <Skeleton className="h-3 w-56 max-w-[90%] rounded-md" />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="space-y-1.5 text-right">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="ml-auto h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="size-9 rounded-[9px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
