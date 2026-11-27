"use client";

import { SignOutButton, UserButton } from "@clerk/nextjs";
import { LogOut, Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MiniBlobatar } from "@/components/layout/mini-blobatar";
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@/components/layout/nav-config";
import { PrivacyToggleButton } from "@/components/layout/privacy-toggle-button";
import type { DashboardUserProfile } from "@/components/layout/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
  user: DashboardUserProfile;
  onOpenBlobatarStudio: () => void;
}

export function AppSidebar({ user, onOpenBlobatarStudio }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navigasi utama desktop"
      className="border-ink bg-card sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col gap-4 overflow-y-auto border-r-[3px] px-4 py-5 lg:flex"
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

      {/* Profile Card (Blobatar Studio trigger + Clerk controls) */}
      <div className="border-ink bg-subtle shadow-brutal-sm flex flex-col gap-2.5 rounded-2xl border-[2.5px] p-2.5">
        <button
          type="button"
          onClick={onOpenBlobatarStudio}
          aria-label="Buka Blobatar Studio untuk melihat profil dan pengaturan privasi"
          className="border-ink bg-card hover:bg-yellow flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-2.5 py-2 text-left transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <span className="border-ink bg-yellow/60 flex size-11 shrink-0 items-center justify-center rounded-xl border-2 p-1">
            <MiniBlobatar seed={user.avatarSeed} className="size-9" />
          </span>
          <span className="min-w-0 flex-1">
            <span
              translate="no"
              className="font-display text-ink block truncate text-sm leading-tight font-bold"
            >
              @{user.handle}
            </span>
            <span className="text-ink-muted mt-0.5 block truncate text-[11px] font-semibold">
              Blobatar Studio
            </span>
          </span>
          <Pencil className="text-ink size-4 shrink-0" aria-hidden="true" />
        </button>

        {user.clerkEnabled ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex min-w-0 items-center gap-2">
              <UserButton />
              <span className="text-ink-muted truncate text-xs font-semibold">Akun Clerk</span>
            </div>
            <SignOutButton redirectUrl="/">
              <Button variant="outline" size="sm" className="min-h-9 px-2.5 text-xs">
                <LogOut className="size-3.5" aria-hidden="true" />
                Keluar
              </Button>
            </SignOutButton>
          </div>
        ) : null}
      </div>

      {/* 5 Active-Aware Navigation Links */}
      <nav aria-label="Menu aplikasi" className="flex flex-col gap-1.5">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[46px] items-center gap-3 rounded-[10px] border-[2.5px] px-3.5 py-2.5 text-sm font-bold transition-[transform,box-shadow,background-color,border-color] duration-150",
                active
                  ? "border-ink bg-lime text-ink shadow-brutal-sm"
                  : "text-ink hover:border-ink hover:bg-subtle border-transparent bg-transparent hover:translate-x-0.5"
              )}
            >
              <Icon
                className={cn("size-5 shrink-0", active && "scale-105")}
                strokeWidth={2.4}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer: Privacy Toggle #2 */}
      <div className="border-ink/25 mt-auto flex flex-col gap-3 border-t-2 border-dashed pt-4">
        <div className="text-ink-muted flex items-center gap-2 px-1 text-xs font-bold">
          <span
            aria-hidden="true"
            className="border-ink bg-lime inline-block size-2.5 shrink-0 rounded-full border-2"
          />
          <span>Mode Privasi Tersinkron</span>
        </div>

        <PrivacyToggleButton id="btn-privacy-sidebar" placement="sidebar" fullWidth />
      </div>
    </aside>
  );
}
