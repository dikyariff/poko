import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardUserProfile, requireDashboardSession } from "@/lib/dashboard-auth";

function DashboardShellSkeleton() {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="border-ink bg-card hidden h-screen w-[264px] shrink-0 flex-col gap-5 border-r-[3px] px-4 py-5 lg:flex">
        <Skeleton className="h-12 w-44 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="mt-auto space-y-2">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-ink bg-canvas flex h-[68px] items-center justify-between border-b-[3px] px-4 lg:h-[76px] lg:px-7">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="hidden h-11 w-40 rounded-xl lg:block" />
        </div>
        <div className="mx-auto w-full max-w-[1180px] space-y-6 p-4 sm:p-6 lg:p-7">
          <Skeleton className="h-56 w-full rounded-[22px]" />
          <div className="grid gap-5 md:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-[22px]" />
            <Skeleton className="h-44 w-full rounded-[22px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function AuthenticatedDashboardShell({ children }: { children: React.ReactNode }) {
  await requireDashboardSession("/dashboard");
  const userProfile = await getDashboardUserProfile();

  return <DashboardShell user={userProfile}>{children}</DashboardShell>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthenticatedDashboardShell>{children}</AuthenticatedDashboardShell>
    </Suspense>
  );
}
