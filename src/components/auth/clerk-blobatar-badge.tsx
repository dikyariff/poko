"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

import { BlobatarAvatar } from "@/components/blobatar/blobatar-avatar";
import { deriveClerkBlobatarSeed } from "@/lib/blobatar";

/**
 * Menampilkan Blobatar deterministik milik user Clerk aktif (menggantikan foto profil Google/UserButton).
 */
export function ClerkBlobatarBadge() {
  const { user } = useUser();

  const seed = deriveClerkBlobatarSeed({
    id: user?.id ?? null,
    username: user?.username ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  });

  const label = user?.firstName?.trim() || user?.username?.trim() || "Profil Poko";

  return (
    <Link
      href="/dashboard"
      aria-label={`Buka dashboard ${label}`}
      className="inline-flex shrink-0 items-center rounded-xl transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <BlobatarAvatar
        seed={seed}
        size="xs"
        trackCursor={false}
        animateIdle
        interactive
        className="bg-yellow/55 shadow-brutal-sm"
        ariaLabel={`Blobatar ${label}`}
      />
    </Link>
  );
}
