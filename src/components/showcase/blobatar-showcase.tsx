"use client";

import * as React from "react";
import { Shield, Sparkles } from "lucide-react";

import type { UpdateBlobatarProfileResult } from "@/actions/profile";
import { BlobatarAvatar } from "@/components/blobatar/blobatar-avatar";
import { BlobatarStudioModal } from "@/components/layout/blobatar-studio-modal";
import { PrivacyToggleButton } from "@/components/layout/privacy-toggle-button";
import type { DashboardUserProfile } from "@/components/layout/types";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BLOBATAR_FRAME_OPTIONS,
  DEFAULT_BLOBATAR_FRAME,
  DEFAULT_DISPLAY_NAME,
  DEFAULT_HANDLE,
  deriveClerkBlobatarSeed,
  extractFirstName,
  validateBlobatarProfileInput,
  type BlobatarProfileInput,
  type BlobatarProfileRecord,
} from "@/lib/blobatar";
import { cn } from "@/lib/utils";

const INITIAL_SHOWCASE_PROFILE: DashboardUserProfile = {
  id: "user_2pokoNielDemo01",
  firstName: DEFAULT_DISPLAY_NAME,
  displayName: DEFAULT_DISPLAY_NAME,
  handle: DEFAULT_HANDLE,
  email: null,
  blobatarSeed: deriveClerkBlobatarSeed({ id: "user_2pokoNielDemo01" }),
  blobatarFrame: DEFAULT_BLOBATAR_FRAME,
  privacyMode: false,
  profilePersisted: false,
  clerkEnabled: false,
};

const SAMPLE_CLERK_ACCOUNTS = [
  { id: "user_2pokoNielDemo01", name: "Niel", handle: "@nielpoko" },
  { id: "user_2pokoSalsaDemo02", name: "Salsa", handle: "@salsacuan" },
  { id: "user_2pokoRakaDemo03", name: "Raka", handle: "@rakasultan" },
] as const;

/**
 * Showcase interaktif BlobatarAvatar di halaman publik `/`:
 * Setiap akun Clerk otomatis mendapatkan 1 avatar Blobatar unik deterministik,
 * dilengkapi 3 pilihan bingkai Neo-Brutalist, cursor-tracking pupils, animasi idle breathe & blink,
 * BlobatarStudioModal asli, dan sinkronisasi 3 tombol Mode Privasi.
 */
export function BlobatarShowcase() {
  const [profile, setProfile] = React.useState<DashboardUserProfile>(INITIAL_SHOWCASE_PROFILE);
  const [studioOpen, setStudioOpen] = React.useState(false);

  async function handleShowcaseSave(
    input: BlobatarProfileInput
  ): Promise<UpdateBlobatarProfileResult> {
    const validated = validateBlobatarProfileInput(input);
    if (!validated.ok) {
      return {
        ok: false,
        error: validated.error,
        fieldErrors: validated.fieldErrors,
      };
    }

    const record: BlobatarProfileRecord = {
      id: profile.id,
      ...validated.data,
      blobatar_seed: profile.blobatarSeed,
      privacy_mode: profile.privacyMode,
    };

    return {
      ok: true,
      profile: record,
    };
  }

  function handleProfileSaved(saved: BlobatarProfileRecord) {
    setProfile((prev) => ({
      ...prev,
      displayName: saved.display_name,
      firstName: extractFirstName(saved.display_name),
      handle: saved.handle,
      blobatarFrame: saved.blobatar_frame,
      privacyMode: saved.privacy_mode,
    }));
  }

  return (
    <section
      aria-label="Showcase BlobatarAvatar & Blobatar Studio"
      data-testid="blobatar-showcase"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="border-ink bg-lime shadow-brutal-sm inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold uppercase">
            <Sparkles className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            Phase 2 · Blobatar Avatar
          </span>
          <h2 className="font-display text-ink mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Satu Akun Clerk, Satu Blobatar Unik
          </h2>
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          data-testid="open-blobatar-studio"
          onClick={() => setStudioOpen(true)}
        >
          <Sparkles className="size-4 stroke-[2.5]" aria-hidden="true" />
          Buka Blobatar Studio
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Live Interactive Blobatar Card */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Avatar Aktif &amp; Mode Privasi</CardTitle>
            <CardDescription>
              Gerakkan kursor untuk melihat pupil mengikuti arah pandang secara halus.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="border-ink bg-subtle flex items-center gap-4 rounded-2xl border-[2.5px] p-4">
              <BlobatarAvatar
                seed={profile.blobatarSeed}
                frame={profile.blobatarFrame}
                size="lg"
                trackCursor
                animateIdle
                interactive
                className="bg-yellow/40"
                ariaLabel={`Blobatar utama ${profile.displayName}`}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p
                  data-testid="showcase-display-name"
                  className="font-display text-ink truncate text-xl font-bold"
                >
                  {profile.displayName}
                </p>
                <p
                  translate="no"
                  data-testid="showcase-handle"
                  className="text-ink-muted truncate font-mono text-xs font-extrabold"
                >
                  {profile.handle}
                </p>
                <p className="text-ink-soft text-[11px] font-semibold">
                  Dihasilkan otomatis dari profil Clerk
                </p>
              </div>
            </div>

            {/* Synchronized Privacy Controls Preview (#1 Hero + #2 Sidebar, paired with #3 inside Studio Modal) */}
            <div className="border-ink bg-yellow/45 space-y-3 rounded-2xl border-[2.5px] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink flex items-center gap-1.5 text-xs font-extrabold uppercase">
                  <Shield className="size-3.5" aria-hidden="true" />
                  Saldo Simulasi
                </span>
                <span className="text-ink text-base font-extrabold">
                  <PrivateAmount amount={5025000} />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PrivacyToggleButton id="btn-privacy-hero" placement="hero" fullWidth />
                <PrivacyToggleButton id="btn-privacy-sidebar" placement="sidebar" fullWidth />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3 Frames + 1-User-1-Avatar Clerk Showcase */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>3 Bingkai Neo-Brutalist &amp; Identitas Unik Clerk</CardTitle>
            <CardDescription>
              Setiap user Clerk otomatis memiliki satu karakter Blobatar tetap; cukup pilih gaya
              bingkai favoritmu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2.5">
              {BLOBATAR_FRAME_OPTIONS.map((item) => {
                const active = profile.blobatarFrame === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-showcase-frame={item.id}
                    aria-pressed={active}
                    onClick={() => setProfile((prev) => ({ ...prev, blobatarFrame: item.id }))}
                    className={cn(
                      "border-ink flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-center transition-[transform,box-shadow,background-color] duration-150",
                      active
                        ? "bg-cyan shadow-brutal-sm -translate-x-0.5 -translate-y-0.5"
                        : "bg-card hover:bg-subtle hover:-translate-x-0.5 hover:-translate-y-0.5"
                    )}
                  >
                    <BlobatarAvatar
                      seed={profile.blobatarSeed}
                      frame={item.id}
                      size="sm"
                      trackCursor
                      animateIdle
                      ariaLabel={`Bingkai ${item.label}`}
                    />
                    <span className="text-ink truncate text-xs font-extrabold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-ink/15 space-y-2 border-t-2 pt-4">
              <p className="text-ink-muted text-[11px] font-extrabold uppercase">
                Contoh Avatar Unik per Akun Clerk
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {SAMPLE_CLERK_ACCOUNTS.map((account) => (
                  <div
                    key={account.id}
                    data-clerk-sample={account.id}
                    className="border-ink bg-subtle flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2.5 text-center"
                  >
                    <BlobatarAvatar
                      seed={deriveClerkBlobatarSeed({ id: account.id })}
                      frame={profile.blobatarFrame}
                      size="sm"
                      trackCursor
                      animateIdle
                      ariaLabel={`Avatar ${account.name}`}
                    />
                    <div className="w-full min-w-0">
                      <p className="font-display text-ink truncate text-xs font-bold">
                        {account.name}
                      </p>
                      <p
                        translate="no"
                        className="text-ink-muted truncate font-mono text-[10px] font-bold"
                      >
                        {account.handle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BlobatarStudioModal
        open={studioOpen}
        onOpenChange={setStudioOpen}
        user={profile}
        onProfileSaved={handleProfileSaved}
        onSaveProfile={handleShowcaseSave}
      />
    </section>
  );
}
