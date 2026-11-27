"use client";

import * as React from "react";
import { SignOutButton } from "@clerk/nextjs";
import { Check, Loader2, LogOut, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { updateBlobatarProfile, type UpdateBlobatarProfileResult } from "@/actions/profile";
import { BlobatarAvatar } from "@/components/blobatar/blobatar-avatar";
import { PrivacyToggleButton } from "@/components/layout/privacy-toggle-button";
import type { DashboardUserProfile } from "@/components/layout/types";
import { PRIVACY_MASK_TEXT, usePrivacy } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import {
  BLOBATAR_FRAME_OPTIONS,
  PROFILE_LIMITS,
  normalizeHandle,
  validateBlobatarProfileInput,
  type BlobatarFrame,
  type BlobatarProfileField,
  type BlobatarProfileInput,
  type BlobatarProfileRecord,
} from "@/lib/blobatar";
import { cn } from "@/lib/utils";

export interface BlobatarStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DashboardUserProfile;
  onProfileSaved?: (profile: BlobatarProfileRecord) => void;
  /**
   * Optional custom persistence handler (e.g. for public UI showcase preview).
   * Defaults to the real `updateBlobatarProfile` Server Action backed by Supabase `profiles`.
   */
  onSaveProfile?: (input: BlobatarProfileInput) => Promise<UpdateBlobatarProfileResult>;
}

function FrameShapeGlyph({ frame }: { frame: BlobatarFrame }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "border-ink bg-card inline-block size-4 shrink-0 border-2",
        frame === "rounded" && "rounded-[4px]",
        frame === "circle" && "rounded-full",
        frame === "squircle" && "rounded-[34%]"
      )}
    />
  );
}

interface BlobatarStudioFormProps {
  user: DashboardUserProfile;
  onOpenChange: (open: boolean) => void;
  onProfileSaved?: (profile: BlobatarProfileRecord) => void;
  onSaveProfile?: (input: BlobatarProfileInput) => Promise<UpdateBlobatarProfileResult>;
}

function BlobatarStudioForm({
  user,
  onOpenChange,
  onProfileSaved,
  onSaveProfile,
}: BlobatarStudioFormProps) {
  const { isPrivate } = usePrivacy();

  const [displayName, setDisplayName] = React.useState(user.displayName);
  const [handle, setHandle] = React.useState(user.handle);
  const [frame, setFrame] = React.useState<BlobatarFrame>(user.blobatarFrame);
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<BlobatarProfileField, string>>
  >({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const activeFrameMeta =
    BLOBATAR_FRAME_OPTIONS.find((item) => item.id === frame) ?? BLOBATAR_FRAME_OPTIONS[0];
  const previewHandle = normalizeHandle(handle);

  function clearFieldError(field: BlobatarProfileField) {
    setFormError(null);
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const payload: BlobatarProfileInput = {
      display_name: displayName,
      handle,
      blobatar_frame: frame,
    };

    const clientCheck = validateBlobatarProfileInput(payload);
    if (!clientCheck.ok) {
      setFieldErrors(clientCheck.fieldErrors);
      setFormError(clientCheck.error);
      toast.error(clientCheck.error, { id: "poko-blobatar-error" });
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsPending(true);

    try {
      const saveFn = onSaveProfile ?? updateBlobatarProfile;
      const result = await saveFn(clientCheck.data);

      if (!result.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setFormError(result.error);
        toast.error("Gagal menyimpan profil", {
          id: "poko-blobatar-error",
          description: result.error,
        });
        return;
      }

      onProfileSaved?.(result.profile);
      toast.success("Profil Blobatar tersimpan!", {
        id: "poko-blobatar-saved",
        description: `${result.profile.display_name} (${result.profile.handle}) · Bingkai ${activeFrameMeta.label}`,
      });
      onOpenChange(false);
    } catch {
      const fallbackError = "Terjadi kendala saat menyimpan profil. Coba lagi ya.";
      setFormError(fallbackError);
      toast.error("Gagal menyimpan profil", {
        id: "poko-blobatar-error",
        description: fallbackError,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
      {/* Live Single-Avatar Preview Stage (derived deterministically from Clerk profile) */}
      <div
        data-testid="blobatar-studio-preview"
        className="border-ink bg-subtle flex items-center gap-3.5 rounded-2xl border-[2.5px] p-3.5 sm:gap-4 sm:p-4"
      >
        <BlobatarAvatar
          seed={user.blobatarSeed}
          frame={frame}
          size="lg"
          trackCursor
          animateIdle
          interactive
          className="bg-yellow/35 shrink-0 sm:size-28 sm:p-2"
          svgClassName="sm:size-24"
          ariaLabel={`Blobatar unik milik ${displayName.trim() || user.displayName}`}
        />

        <div className="min-w-0 flex-1 space-y-1.5 text-left">
          <p className="font-display text-ink truncate text-lg leading-tight font-bold">
            {displayName.trim() || user.displayName}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              translate="no"
              data-testid="studio-preview-handle"
              className="border-ink bg-card shadow-brutal-sm inline-flex max-w-full items-center truncate rounded-full border-2 px-2.5 py-0.5 font-mono text-[11px] font-extrabold"
            >
              {previewHandle}
            </span>
            <span className="border-ink bg-cyan/70 inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold">
              {activeFrameMeta.label}
            </span>
          </div>
          <p className="text-ink-muted text-[11px] leading-snug font-medium">
            Avatar unik dibuat otomatis dari akun Clerk kamu.
          </p>
        </div>
      </div>

      {/* Identity Inputs: Display Name & Handle */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor="studio-display-name"
            className="text-ink flex items-center justify-between text-[11px] font-extrabold uppercase"
          >
            <span>Nama Tampilan</span>
            <span className="text-ink-soft font-mono text-[10px] font-bold">
              {displayName.trim().length}/{PROFILE_LIMITS.displayNameMax}
            </span>
          </label>
          <Input
            id="studio-display-name"
            name="display_name"
            type="text"
            maxLength={PROFILE_LIMITS.displayNameMax}
            autoComplete="nickname"
            placeholder="cth: Niel"
            value={displayName}
            aria-invalid={Boolean(fieldErrors.display_name)}
            onChange={(e) => {
              setDisplayName(e.target.value);
              clearFieldError("display_name");
            }}
            className="min-h-10 px-3 py-1.5 text-sm"
          />
          {fieldErrors.display_name ? (
            <p className="text-expense text-[11px] font-bold">{fieldErrors.display_name}</p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor="studio-handle"
            className="text-ink flex items-center justify-between text-[11px] font-extrabold uppercase"
          >
            <span>Handle</span>
            <span className="text-ink-soft font-mono text-[10px] font-bold">
              Auto @ · maks {PROFILE_LIMITS.handleMax}
            </span>
          </label>
          <Input
            id="studio-handle"
            name="handle"
            type="text"
            maxLength={PROFILE_LIMITS.handleMax}
            spellCheck={false}
            autoComplete="username"
            placeholder="@nielpoko"
            value={handle}
            aria-invalid={Boolean(fieldErrors.handle)}
            onChange={(e) => {
              setHandle(e.target.value);
              clearFieldError("handle");
            }}
            className="min-h-10 px-3 py-1.5 font-mono text-sm"
          />
          {fieldErrors.handle ? (
            <p className="text-expense text-[11px] font-bold">{fieldErrors.handle}</p>
          ) : null}
        </div>
      </div>

      {/* 3 Frame Selector */}
      <fieldset className="space-y-1.5">
        <legend className="text-ink text-[11px] font-extrabold uppercase">
          Bingkai Avatar (3)
        </legend>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Pilih bingkai Blobatar">
          {BLOBATAR_FRAME_OPTIONS.map((option) => {
            const selected = frame === option.id;
            return (
              <button
                key={option.id}
                type="button"
                data-frame-option={option.id}
                aria-pressed={selected}
                onClick={() => {
                  setFrame(option.id);
                  clearFieldError("blobatar_frame");
                }}
                className={cn(
                  "border-ink flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border-2 px-2 py-2 text-xs font-extrabold transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none sm:gap-2",
                  selected
                    ? "bg-cyan text-ink shadow-brutal-sm -translate-x-0.5 -translate-y-0.5"
                    : "bg-card text-ink hover:bg-subtle hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#111111]"
                )}
              >
                <FrameShapeGlyph frame={option.id} />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Synchronized Privacy Mode Control (#3) */}
      <div className="border-ink bg-card shadow-brutal-sm flex flex-col gap-2.5 rounded-2xl border-[2.5px] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="font-display text-ink flex items-center gap-1.5 text-sm font-bold">
              <Shield className="size-4 shrink-0" aria-hidden="true" />
              Mode Privasi Saldo
            </p>
            <span
              data-testid="studio-privacy-badge"
              className={cn(
                "border-ink shrink-0 rounded-full border-2 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase",
                isPrivate ? "bg-ink text-white" : "bg-subtle text-ink"
              )}
            >
              {isPrivate ? "Aktif" : "Mati"}
            </span>
          </div>
          <p className="text-ink-muted text-[11px] leading-snug">
            {isPrivate ? (
              <>
                Seluruh nominal tampil sebagai{" "}
                <span className="text-ink font-mono font-bold">{PRIVACY_MASK_TEXT}</span>.
              </>
            ) : (
              <>
                Sembunyikan nominal menjadi{" "}
                <span className="text-ink font-mono font-bold">{PRIVACY_MASK_TEXT}</span> di tempat
                umum.
              </>
            )}
          </p>
        </div>

        <PrivacyToggleButton
          id="btn-privacy-modal"
          placement="modal"
          className="min-h-10 w-full shrink-0 sm:w-auto"
        />
      </div>

      {formError ? (
        <p
          role="alert"
          className="border-ink bg-coral/20 text-expense rounded-xl border-2 px-3 py-2 text-xs font-bold"
        >
          {formError}
        </p>
      ) : null}

      <ResponsiveModalFooter className="mt-0.5 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        {user.clerkEnabled ? (
          <SignOutButton redirectUrl="/">
            <Button variant="outline" size="sm" className="min-h-10 w-full sm:w-auto">
              <LogOut className="size-4" aria-hidden="true" />
              Keluar Akun
            </Button>
          </SignOutButton>
        ) : (
          <ResponsiveModalClose asChild>
            <Button variant="outline" size="sm" className="min-h-10 w-full sm:w-auto">
              Tutup
            </Button>
          </ResponsiveModalClose>
        )}

        <Button
          type="submit"
          variant="default"
          disabled={isPending}
          data-testid="btn-save-blobatar-profile"
          className="min-h-10 w-full sm:w-auto sm:min-w-[176px]"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check className="size-4 stroke-[2.75]" aria-hidden="true" />
              <span>Simpan ke Profil</span>
            </>
          )}
        </Button>
      </ResponsiveModalFooter>
    </form>
  );
}

export function BlobatarStudioModal({
  open,
  onOpenChange,
  user,
  onProfileSaved,
  onSaveProfile,
}: BlobatarStudioModalProps) {
  const formResetKey = `${user.id}:${user.displayName}:${user.handle}:${user.blobatarSeed}:${user.blobatarFrame}`;

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="gap-3 sm:max-w-[520px] sm:p-5">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <Sparkles className="size-5 shrink-0" aria-hidden="true" />
            Blobatar Studio
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Atur nama tampilan, handle, bingkai avatar, &amp; Mode Privasi akun kamu.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {open ? (
          <BlobatarStudioForm
            key={formResetKey}
            user={user}
            onOpenChange={onOpenChange}
            onProfileSaved={onProfileSaved}
            onSaveProfile={onSaveProfile}
          />
        ) : null}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
