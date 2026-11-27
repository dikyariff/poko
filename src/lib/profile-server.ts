import { auth, currentUser } from "@clerk/nextjs/server";

import {
  DEFAULT_BLOBATAR_FRAME,
  DEFAULT_BLOBATAR_MOOD,
  DEFAULT_DISPLAY_NAME,
  DEFAULT_HANDLE,
  deriveClerkBlobatarSeed,
  normalizeBlobatarFrame,
  normalizeDisplayName,
  normalizeHandle,
  type BlobatarProfileRecord,
} from "@/lib/blobatar";
import { isClerkServerConfigured } from "@/lib/clerk-config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export interface GetOrCreateProfileOptions {
  userId?: string | null;
  clerkSeed?: string | null;
  fallbackDisplayName?: string | null;
  fallbackHandle?: string | null;
}

export interface GetOrCreateProfileResult {
  profile: BlobatarProfileRecord;
  persisted: boolean;
  source: "supabase" | "fallback";
}

function buildFallbackProfile(
  userId: string,
  clerkSeed: string,
  fallbackDisplayName?: string | null,
  fallbackHandle?: string | null
): BlobatarProfileRecord {
  return {
    id: userId,
    display_name: normalizeDisplayName(fallbackDisplayName ?? DEFAULT_DISPLAY_NAME),
    handle: normalizeHandle(fallbackHandle ?? DEFAULT_HANDLE),
    blobatar_seed: clerkSeed,
    blobatar_frame: DEFAULT_BLOBATAR_FRAME,
    privacy_mode: false,
  };
}

function normalizeDbProfileRow(
  row: Pick<Profile, "id" | "display_name" | "handle" | "blobatar_frame" | "privacy_mode">,
  fallback: BlobatarProfileRecord
): BlobatarProfileRecord {
  const displayName = row.display_name?.trim()
    ? normalizeDisplayName(row.display_name)
    : fallback.display_name;
  const handle = row.handle?.trim() ? normalizeHandle(row.handle) : fallback.handle;

  return {
    id: row.id,
    display_name: displayName,
    handle,
    // Selalu gunakan seed deterministik dari profil Clerk agar tiap user hanya memiliki 1 avatar unik.
    blobatar_seed: fallback.blobatar_seed,
    blobatar_frame: normalizeBlobatarFrame(row.blobatar_frame),
    privacy_mode: Boolean(row.privacy_mode),
  };
}

/**
 * Membaca row `public.profiles` untuk user Clerk aktif via `createServerSupabaseClient()`.
 * Seed Blobatar selalu diturunkan otomatis dari profil Clerk (1 user = 1 avatar unik).
 * Jika row belum ada (login pertama kali), otomatis melakukan `upsert` row default Poko.
 * Jika Supabase belum terkonfigurasi atau sedang offline, mengembalikan fallback aman tanpa crash.
 */
export async function getOrCreateProfile(
  options?: GetOrCreateProfileOptions
): Promise<GetOrCreateProfileResult> {
  let userId = options?.userId ?? null;
  let clerkSeed = options?.clerkSeed ?? null;
  let fallbackDisplayName = options?.fallbackDisplayName ?? null;
  let fallbackHandle = options?.fallbackHandle ?? null;

  if (!userId && isClerkServerConfigured()) {
    const authState = await auth();
    userId = authState.userId ?? null;
  }

  if (
    (!fallbackDisplayName || !fallbackHandle || !clerkSeed) &&
    userId &&
    isClerkServerConfigured()
  ) {
    try {
      const user = await currentUser();
      if (user) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
        const email = user.primaryEmailAddress?.emailAddress ?? null;

        fallbackDisplayName =
          fallbackDisplayName ||
          fullName ||
          user.username ||
          email?.split("@")[0] ||
          DEFAULT_DISPLAY_NAME;
        fallbackHandle = fallbackHandle || (user.username ? `@${user.username}` : DEFAULT_HANDLE);
        clerkSeed =
          clerkSeed ||
          deriveClerkBlobatarSeed({
            id: user.id,
            username: user.username,
            email,
          });
      }
    } catch {
      // Fallback safely to Poko defaults if Clerk user lookup is unavailable
    }
  }

  const effectiveUserId = userId || "offline-preview";
  const resolvedClerkSeed = clerkSeed || deriveClerkBlobatarSeed({ id: userId });
  const fallback = buildFallbackProfile(
    effectiveUserId,
    resolvedClerkSeed,
    fallbackDisplayName,
    fallbackHandle
  );

  if (!userId || !isSupabaseConfigured()) {
    return {
      profile: fallback,
      persisted: false,
      source: "fallback",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id, display_name, handle, blobatar_frame, privacy_mode")
      .eq("id", userId)
      .maybeSingle();

    if (selectError) {
      console.warn(
        "[poko/profile] Failed to read profiles row, using fallback:",
        selectError.message
      );
      return {
        profile: fallback,
        persisted: false,
        source: "fallback",
      };
    }

    if (existing) {
      return {
        profile: normalizeDbProfileRow(existing, fallback),
        persisted: true,
        source: "supabase",
      };
    }

    const { data: created, error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          display_name: fallback.display_name,
          handle: fallback.handle,
          blobatar_seed: resolvedClerkSeed,
          blobatar_mood: DEFAULT_BLOBATAR_MOOD,
          blobatar_frame: DEFAULT_BLOBATAR_FRAME,
          privacy_mode: false,
        },
        { onConflict: "id" }
      )
      .select("id, display_name, handle, blobatar_frame, privacy_mode")
      .single();

    if (upsertError || !created) {
      console.warn(
        "[poko/profile] Failed to auto-upsert initial profile row, using fallback:",
        upsertError?.message ?? "No row returned"
      );
      return {
        profile: fallback,
        persisted: false,
        source: "fallback",
      };
    }

    return {
      profile: normalizeDbProfileRow(created, fallback),
      persisted: true,
      source: "supabase",
    };
  } catch (error) {
    console.warn(
      "[poko/profile] Unexpected Supabase error while resolving profile, using fallback:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      profile: fallback,
      persisted: false,
      source: "fallback",
    };
  }
}
