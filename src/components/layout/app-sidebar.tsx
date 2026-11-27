"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@/components/layout/nav-config";
import type { DashboardUserProfile } from "@/components/layout/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
  user: DashboardUserProfile;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const activeIndex = DASHBOARD_NAV_ITEMS.findIndex((item) => isNavItemActive(pathname, item.href));

  return (
    <aside
      aria-label="Navigasi utama desktop"
      className="border-ink bg-card hidden w-[264px] shrink-0 flex-col gap-4 overflow-y-auto border-r-[3px] px-4 py-5 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex"
    >
      {/* Brand Lockup */}
      <Link
        href="/dashboard"
        className="group flex items-center gap-3 rounded-xl px-1 py-1 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className="border-ink bg-lime shadow-brutal-sm font-display text-ink flex size-11 shrink-0 items-center justify-center rounded-xl border-[2.5px] text-2xl leading-none font-bold transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
        >
          P
        </span>
        <div className="min-w-0">
          <p
            translate="no"
            className="font-display text-ink text-[1.35rem] leading-none font-bold tracking-tight"
          >
            Poko
          </p>
          <p className="text-ink-muted mt-1 text-xs leading-tight font-semibold">
            Kantong rapi, impian pasti
          </p>
        </div>
      </Link>

      {/* 5 Active-Aware Navigation Links with Smooth Sliding Indicator */}
      <nav aria-label="Menu aplikasi" className="relative flex flex-col gap-1.5">
        {activeIndex >= 0 ? (
          <span
            aria-hidden="true"
            data-slot="sidebar-nav-indicator"
            style={{
              transform: `translate3d(0, ${activeIndex * 52}px, 0)`,
            }}
            className="border-ink bg-lime shadow-brutal-sm pointer-events-none absolute inset-x-0 top-0 z-0 h-[46px] rounded-[10px] border-[2.5px] transition-transform duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)] will-change-transform motion-reduce:transition-none"
          />
        ) : null}

        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 flex h-[46px] items-center gap-3 rounded-[10px] border-[2.5px] px-3.5 text-sm font-bold transition-[transform,background-color,border-color] duration-150",
                active
                  ? "text-ink border-transparent bg-transparent"
                  : "text-ink hover:border-ink hover:bg-subtle border-transparent bg-transparent hover:translate-x-0.5"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-transform duration-200",
                  active && "scale-105"
                )}
                strokeWidth={2.4}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Bottom-Left Footer: Logout */}
      {user.clerkEnabled ? (
        <div className="border-ink/25 mt-auto border-t-2 border-dashed pt-4">
          <SignOutButton redirectUrl="/">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-coral/25 hover:text-expense min-h-10 w-full justify-start px-3.5 text-xs font-extrabold"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Keluar Akun
            </Button>
          </SignOutButton>
        </div>
      ) : null}
    </aside>
  );
}
