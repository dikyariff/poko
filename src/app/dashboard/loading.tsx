import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex w-full flex-col gap-5 sm:gap-6">
      <div className="grid gap-5 xl:grid-cols-12">
        <Skeleton className="h-64 w-full rounded-[22px] xl:col-span-8" />
        <Skeleton className="h-64 w-full rounded-[22px] xl:col-span-4" />
      </div>
      <Skeleton className="h-44 w-full rounded-[22px]" />
      <div className="grid gap-5 lg:grid-cols-12">
        <Skeleton className="h-72 w-full rounded-[22px] lg:col-span-7" />
        <Skeleton className="h-72 w-full rounded-[22px] lg:col-span-5" />
      </div>
    </div>
  );
}
