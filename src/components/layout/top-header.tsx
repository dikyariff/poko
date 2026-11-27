"use client";

import { Pencil } from "lucide-react";
import { usePathname } from "next/navigation";

import { BlobatarAvatar } from "@/components/blobatar/blobatar-avatar";
import { getActiveRouteMeta } from "@/components/layout/nav-config";
import type { DashboardUserProfile } from "@/components/layout/types";

export interface TopHeaderProps {
  user: DashboardUserProfile;
  onOpenBlobatarStudio: () => void;
}

/**
 * Top Header Minimalis sesuai preferensi UX owner:
 * - Desktop (>= 1024px): greeting singkat + judul halaman aktif di kiri, dan kartu profil Blobatar di kanan.
 *   Tanpa tombol Catat Transaksi, tanpa tombol audio, tanpa badge streak bulanan.
 * - Mobile (< 1024px): HANYA avatar Blobatar ringkas (buka Blobatar Studio) + judul halaman tampil penuh tanpa terpotong.
 *   Tanpa badge streak & tanpa tombol audio.
 */
export function TopHeader({ user, onOpenBlobatarStudio }: TopHeaderProps) {
  const pathname = usePathname();
  const activeRoute = getActiveRouteMeta(pathname);

  return (
    <header
      data-slot="top-header"
      className="border-ink bg-canvas/95 fixed inset-x-0 top-0 z-30 border-b-[3px] backdrop-blur-sm lg:left-[264px]"
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1180px] items-center justify-between gap-3 px-4 lg:h-[76px] lg:px-7">
        {/* Left: Mobile Blobatar trigger (< 1024px) + Greeting (desktop) + Active Route Title */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onOpenBlobatarStudio}
            aria-label="Buka Blobatar Studio"
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-2xl transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] lg:hidden"
          >
            <BlobatarAvatar
              seed={user.blobatarSeed}
              frame={user.blobatarFrame}
              size="sm"
              trackCursor
              animateIdle
              interactive
              className="bg-yellow/75"
              ariaLabel={`Blobatar ${user.displayName}`}
            />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-ink-muted hidden text-xs leading-tight font-bold lg:block">
              Halo, {user.firstName} 👋
            </p>
            <h1
              data-slot="top-header-title"
              className="font-display text-ink text-lg leading-tight font-bold tracking-tight sm:text-xl lg:text-[1.45rem]"
            >
              {activeRoute.pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Desktop User Profile Card (>= 1024px) */}
        <button
          type="button"
          onClick={onOpenBlobatarStudio}
          data-slot="top-header-profile-card"
          aria-label="Buka Blobatar Studio untuk mengedit profil, bingkai avatar, dan Mode Privasi"
          className="border-ink bg-subtle hover:bg-yellow shadow-brutal-sm hidden min-h-[52px] max-w-[260px] shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl border-[2.5px] px-2.5 py-1.5 text-left transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-none lg:inline-flex"
        >
          <BlobatarAvatar
            seed={user.blobatarSeed}
            frame={user.blobatarFrame}
            size="xs"
            trackCursor
            animateIdle
            interactive
            className="bg-yellow/45 shadow-none"
            ariaLabel={`Blobatar ${user.displayName}`}
          />
          <span className="min-w-0 flex-1">
            <span className="font-display text-ink block truncate text-sm leading-tight font-bold">
              {user.displayName}
            </span>
            <span
              translate="no"
              className="text-ink-muted mt-0.5 block truncate font-mono text-[11px] font-bold"
            >
              {user.handle}
            </span>
          </span>
          <Pencil className="text-ink size-3.5 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
