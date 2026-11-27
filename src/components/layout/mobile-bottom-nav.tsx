"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const activeIndex = DASHBOARD_NAV_ITEMS.findIndex((item) => isNavItemActive(pathname, item.href));

  return (
    <nav
      aria-label="Navigasi seluler"
      data-slot="mobile-bottom-nav"
      className="border-ink bg-card shadow-brutal fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom,0px))] z-40 rounded-[20px] border-[3px] p-1.5 lg:hidden"
    >
      <div className="relative grid grid-cols-5 items-center">
        {/* Smooth GPU-composited sliding Neo-Brutalist active indicator pill */}
        {activeIndex >= 0 ? (
          <div
            aria-hidden="true"
            data-slot="mobile-nav-indicator"
            style={{
              width: "20%",
              transform: `translate3d(${activeIndex * 100}%, -2px, 0)`,
            }}
            className="pointer-events-none absolute inset-y-0 left-0 z-0 px-0.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)] will-change-transform motion-reduce:transition-none"
          >
            <span className="border-ink bg-lime block h-full w-full rounded-xl border-2 shadow-[2px_2px_0px_#111111]" />
          </div>
        ) : null}

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
                "relative z-10 flex min-h-[48px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-center transition-[color,transform] duration-200 active:scale-95",
                active ? "text-ink -translate-y-0.5" : "text-ink-muted hover:text-ink"
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-transform duration-200",
                  active && "scale-105"
                )}
                strokeWidth={2.4}
                aria-hidden="true"
              />
              <span className="w-full truncate text-[11px] leading-none font-extrabold">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
