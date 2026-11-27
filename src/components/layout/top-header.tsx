"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { BlobatarAvatar } from "@/components/blobatar/blobatar-avatar";
import { getActiveRouteMeta } from "@/components/layout/nav-config";
import type { DashboardUserProfile } from "@/components/layout/types";
import { Button } from "@/components/ui/button";

export interface TopHeaderProps {
  user: DashboardUserProfile;
  onOpenBlobatarStudio: () => void;
}

/**
 * Top Header Minimalis sesuai preferensi UX owner:
 * - Desktop (>= 1024px): HANYA greeting singkat + judul halaman aktif + tombol utama "+ Catat Transaksi".
 *   Tanpa tombol audio, tanpa badge streak bulanan, tanpa duplikasi profile pill.
 * - Mobile (< 1024px): HANYA avatar Blobatar ringkas (buka Blobatar Studio) + judul halaman tampil penuh tanpa terpotong.
 *   Tanpa badge streak & tanpa tombol audio.
 */
export function TopHeader({ user, onOpenBlobatarStudio }: TopHeaderProps) {
  const pathname = usePathname();
  const activeRoute = getActiveRouteMeta(pathname);

  function handleQuickAddTransaction() {
    toast.info("Catat Transaksi segera aktif", {
      id: "poko-quick-add-toast",
      description: "Modal tambah transaksi & Scan Struk AI akan hadir pada tahap berikutnya.",
    });
  }

  return (
    <header
      data-slot="top-header"
      className="border-ink bg-canvas/95 sticky top-0 z-30 border-b-[3px] backdrop-blur-sm"
    >
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-3 lg:min-h-[76px] lg:px-7">
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

        {/* Right: Desktop Primary CTA ONLY (>= 1024px) */}
        <div className="hidden shrink-0 items-center lg:flex">
          <Button type="button" variant="default" onClick={handleQuickAddTransaction}>
            <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
            Catat Transaksi
          </Button>
        </div>
      </div>
    </header>
  );
}
