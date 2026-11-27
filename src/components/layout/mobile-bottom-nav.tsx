"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi seluler"
      data-slot="mobile-bottom-nav"
      className="border-ink bg-card shadow-brutal fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom,0px))] z-40 grid grid-cols-5 items-center gap-1 rounded-[20px] border-[3px] p-1.5 lg:hidden"
    >
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[48px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 py-1.5 text-center transition-[transform,box-shadow,background-color,border-color] duration-150 active:scale-95",
              active
                ? "border-ink bg-lime text-ink -translate-y-0.5 shadow-[2px_2px_0px_#111111]"
                : "text-ink-muted hover:text-ink border-transparent bg-transparent"
            )}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={2.4} aria-hidden="true" />
            <span className="w-full truncate text-[11px] leading-none font-extrabold">
              {item.shortLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
