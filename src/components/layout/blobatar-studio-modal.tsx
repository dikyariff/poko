"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut, Shield, Sparkles } from "lucide-react";

import { MiniBlobatar } from "@/components/layout/mini-blobatar";
import { PrivacyToggleButton } from "@/components/layout/privacy-toggle-button";
import type { DashboardUserProfile } from "@/components/layout/types";
import { PRIVACY_MASK_TEXT, usePrivacy } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";

export interface BlobatarStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DashboardUserProfile;
}

export function BlobatarStudioModal({ open, onOpenChange, user }: BlobatarStudioModalProps) {
  const { isPrivate } = usePrivacy();

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[460px]">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <Sparkles className="size-5 shrink-0" aria-hidden="true" />
            Blobatar Studio
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Profil ringkas akun kamu &amp; kontrol cepat Mode Privasi di seluruh aplikasi.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="space-y-4">
          {/* Ringkas Blobatar Preview Stage */}
          <div className="border-ink bg-subtle flex flex-col items-center gap-3 rounded-2xl border-[2.5px] p-5 text-center">
            <div className="border-ink bg-yellow shadow-brutal-sm flex size-24 items-center justify-center rounded-[26px] border-[2.5px] p-2">
              <MiniBlobatar seed={user.avatarSeed} className="size-20" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  translate="no"
                  className="border-ink bg-card shadow-brutal-sm inline-flex items-center rounded-full border-2 px-3 py-0.5 font-mono text-xs font-extrabold"
                >
                  @{user.handle}
                </span>
                <span className="border-ink bg-lime inline-flex items-center rounded-full border-2 px-2.5 py-0.5 font-mono text-[11px] font-bold">
                  Preview Ringkas
                </span>
              </div>
              <p className="font-display text-ink text-lg font-bold">{user.displayName}</p>
              {user.email ? (
                <p className="text-ink-muted text-xs font-medium break-all">{user.email}</p>
              ) : null}
            </div>

            <p className="text-ink-muted max-w-xs text-xs leading-relaxed">
              Kustomisasi penuh bentuk, ekspresi mood, bingkai Blobatar &amp; simpan otomatis ke
              database akan aktif pada tahap berikutnya.
            </p>
          </div>

          {/* Synchronized Privacy Mode Control (#3) */}
          <div className="border-ink bg-card shadow-brutal-sm space-y-3 rounded-2xl border-[2.5px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-display text-ink flex items-center gap-1.5 text-sm font-bold">
                  <Shield className="size-4 shrink-0" aria-hidden="true" />
                  Mode Privasi Saldo
                </p>
                <p className="text-ink-muted text-xs leading-relaxed">
                  {isPrivate ? (
                    <>
                      Aktif — seluruh nominal tampil sebagai{" "}
                      <span className="text-ink font-mono font-bold">{PRIVACY_MASK_TEXT}</span>.
                    </>
                  ) : (
                    <>
                      Nonaktif — sembunyikan seluruh nominal menjadi{" "}
                      <span className="text-ink font-mono font-bold">{PRIVACY_MASK_TEXT}</span> saat
                      di tempat umum.
                    </>
                  )}
                </p>
              </div>
              <span
                className={`border-ink shrink-0 rounded-full border-2 px-2.5 py-0.5 font-mono text-[11px] font-extrabold uppercase ${
                  isPrivate ? "bg-ink text-white" : "bg-subtle text-ink"
                }`}
              >
                {isPrivate ? "Aktif" : "Mati"}
              </span>
            </div>

            <PrivacyToggleButton id="btn-privacy-modal" placement="modal" fullWidth />
          </div>
        </div>

        <ResponsiveModalFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {user.clerkEnabled ? (
            <SignOutButton redirectUrl="/">
              <Button variant="outline" size="sm" className="min-h-11 w-full sm:w-auto">
                <LogOut className="size-4" aria-hidden="true" />
                Keluar Akun
              </Button>
            </SignOutButton>
          ) : (
            <div aria-hidden="true" />
          )}

          <ResponsiveModalClose asChild>
            <Button variant="default" size="sm" className="min-h-11 w-full sm:w-auto">
              Selesai
            </Button>
          </ResponsiveModalClose>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
