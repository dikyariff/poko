"use client";

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { PRIVACY_MASK_TEXT, usePrivacy } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PrivacyToggleButtonProps {
  id?: string;
  placement: "hero" | "sidebar" | "modal";
  fullWidth?: boolean;
  className?: string;
}

export function PrivacyToggleButton({
  id,
  placement,
  fullWidth = false,
  className,
}: PrivacyToggleButtonProps) {
  const { isPrivate, togglePrivacy } = usePrivacy();

  function handleToggle() {
    const next = !isPrivate;
    togglePrivacy();
    toast(
      next
        ? `Mode Privasi aktif — nominal disembunyikan (${PRIVACY_MASK_TEXT})`
        : "Nominal ditampilkan kembali",
      { id: "poko-privacy-toast" }
    );
  }

  return (
    <Button
      id={id}
      type="button"
      variant="outline"
      size="sm"
      data-privacy-toggle={placement}
      aria-pressed={isPrivate}
      aria-label={
        isPrivate
          ? "Nonaktifkan Mode Privasi untuk menampilkan nominal"
          : "Aktifkan Mode Privasi untuk menyembunyikan nominal"
      }
      onClick={handleToggle}
      className={cn(
        "min-h-11 px-3.5 text-xs font-extrabold",
        fullWidth && "w-full justify-center",
        isPrivate && "bg-ink hover:bg-ink/90 text-white hover:text-white",
        className
      )}
    >
      {isPrivate ? (
        <EyeOff className="size-4" aria-hidden="true" />
      ) : (
        <Eye className="size-4" aria-hidden="true" />
      )}
      <span data-privacy-text>{isPrivate ? "Tampilkan" : "Sembunyikan"}</span>
    </Button>
  );
}
