"use client";

import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { BlobatarStudioModal } from "@/components/layout/blobatar-studio-modal";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { TopHeader } from "@/components/layout/top-header";
import type { DashboardUserProfile } from "@/components/layout/types";
import { extractFirstName, type BlobatarProfileRecord } from "@/lib/blobatar";

export interface DashboardShellProps {
  user: DashboardUserProfile;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [blobatarOpen, setBlobatarOpen] = useState(false);

  const serverProfileKey = [
    user.id,
    user.displayName,
    user.handle,
    user.blobatarSeed,
    user.blobatarFrame,
  ].join("|");

  const [savedOverride, setSavedOverride] = useState<{
    baseKey: string;
    profile: DashboardUserProfile;
  } | null>(null);

  const activeUser =
    savedOverride && savedOverride.baseKey === serverProfileKey ? savedOverride.profile : user;

  function handleProfileSaved(saved: BlobatarProfileRecord) {
    setSavedOverride({
      baseKey: serverProfileKey,
      profile: {
        ...activeUser,
        displayName: saved.display_name,
        firstName: extractFirstName(saved.display_name),
        handle: saved.handle,
        blobatarSeed: saved.blobatar_seed,
        blobatarFrame: saved.blobatar_frame,
        privacyMode: saved.privacy_mode,
        profilePersisted: true,
      },
    });
  }

  return (
    <div className="flex min-h-screen w-full">
      <a
        href="#main-content"
        className="border-ink bg-lime text-ink shadow-brutal fixed -top-24 left-4 z-50 rounded-[10px] border-[2.5px] px-4 py-2.5 text-sm font-extrabold transition-[top] focus:top-4"
      >
        Langsung ke konten utama
      </a>

      <AppSidebar user={activeUser} onOpenBlobatarStudio={() => setBlobatarOpen(true)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader user={activeUser} onOpenBlobatarStudio={() => setBlobatarOpen(true)} />

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-6 px-4 pt-5 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] focus:outline-none sm:px-6 lg:px-7 lg:py-7"
        >
          {children}
        </main>
      </div>

      <MobileBottomNav />

      <BlobatarStudioModal
        open={blobatarOpen}
        onOpenChange={setBlobatarOpen}
        user={activeUser}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
}
