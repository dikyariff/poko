import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Skeleton className="h-56 w-full rounded-[22px]" />
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-44 w-full rounded-[22px]" />
        <Skeleton className="h-44 w-full rounded-[22px]" />
      </div>
    </div>
  );
}
