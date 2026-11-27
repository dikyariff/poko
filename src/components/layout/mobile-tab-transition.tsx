"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

export type TabSlideDirection = "none" | "forward" | "backward";

const MobileTabDirectionContext = React.createContext<{
  direction: TabSlideDirection;
  pathname: string;
}>({
  direction: "none",
  pathname: "/dashboard",
});

export interface MobileTabTransitionProps {
  children: React.ReactNode;
}

/**
 * Melacak arah perpindahan tab navbar (`forward` / `backward`) dan
 * membagikannya lewat context agar konten halaman mobile selalu meluncur
 * mulus dari kanan/kiri meskipun berada di balik `<Suspense>`.
 */
export function MobileTabTransition({ children }: MobileTabTransitionProps) {
  const pathname = usePathname();
  const activeIndex = DASHBOARD_NAV_ITEMS.findIndex((item) => isNavItemActive(pathname, item.href));
  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;

  const [navState, setNavState] = React.useState<{
    prevIndex: number;
    direction: TabSlideDirection;
  }>({
    prevIndex: resolvedIndex,
    direction: "none",
  });

  if (navState.prevIndex !== resolvedIndex) {
    setNavState({
      prevIndex: resolvedIndex,
      direction: resolvedIndex > navState.prevIndex ? "forward" : "backward",
    });
  }

  const contextValue = React.useMemo(
    () => ({ direction: navState.direction, pathname }),
    [navState.direction, pathname]
  );

  return (
    <MobileTabDirectionContext.Provider value={contextValue}>
      <div
        key={pathname}
        data-slot="mobile-tab-transition"
        data-slide-direction={navState.direction}
        className={cn(
          "flex w-full flex-1 flex-col",
          navState.direction === "forward" && "poko-mobile-slide-forward",
          navState.direction === "backward" && "poko-mobile-slide-backward"
        )}
      >
        {children}
      </div>
    </MobileTabDirectionContext.Provider>
  );
}

/**
 * Pembungkus konten halaman di dalam `<Suspense>` agar saat data selesai
 * di-stream dari server, konten asli ikut meluncur halus sesuai arah tab.
 */
export function MobileTabSlideContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { direction } = React.useContext(MobileTabDirectionContext);

  return (
    <div
      data-slot="mobile-tab-slide-content"
      data-slide-direction={direction}
      className={cn(
        "flex w-full flex-1 flex-col",
        direction === "forward" && "poko-mobile-slide-forward",
        direction === "backward" && "poko-mobile-slide-backward",
        className
      )}
    >
      {children}
    </div>
  );
}
