import { Skeleton } from "@/components/ui/skeleton";

export function RoutePlaceholderSkeleton({ label = "Memuat halaman" }: { label?: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex w-full flex-col gap-5 sm:gap-6">
      <div className="border-ink bg-card shadow-brutal flex flex-col gap-5 rounded-[22px] border-[2.5px] p-5 sm:p-6">
        {/* Header Badges & Title */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-44 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-8 w-64 max-w-full rounded-xl sm:h-9 sm:w-80" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
            <Skeleton className="h-4 w-3/4 max-w-xl rounded-md" />
          </div>
        </div>

        {/* 3 Preview Metric Cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-ink bg-subtle/40 shadow-brutal-sm flex flex-col gap-2.5 rounded-2xl border-[2.5px] p-4"
            >
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Bottom Roadmap Note Bar */}
        <div className="border-ink bg-subtle/40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 p-4">
          <Skeleton className="h-4 w-72 max-w-full rounded-md" />
          <Skeleton className="h-9 w-40 rounded-[9px]" />
        </div>
      </div>
    </div>
  );
}
