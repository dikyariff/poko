import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export const MEMOIRE_BUCKET = "memoire-photos" as const;
export const MEMOIRE_MAX_BYTES = 2 * 1024 * 1024;
export const MEMOIRE_ALLOWED_MIME_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;

export type MemoireAllowedMimeType = (typeof MEMOIRE_ALLOWED_MIME_TYPES)[number];

/**
 * Memeriksa apakah MIME type file termasuk format foto Memoire yang diizinkan oleh bucket.
 */
export function isAllowedMemoireMimeType(mimeType: string): mimeType is MemoireAllowedMimeType {
  return (MEMOIRE_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Membentuk storage object path terisolasi per pengguna untuk bucket `memoire-photos`.
 * Segmen pertama (`userId`) harus cocok dengan `(storage.foldername(name))[1]` pada RLS policy.
 */
export function buildMemoirePhotoPath(
  userId: string,
  dreamId: string,
  ext: string = "webp"
): string {
  const cleanUserId = userId.trim().replace(/^\/+|\/+$/g, "");
  const cleanDreamId = dreamId.trim().replace(/^\/+|\/+$/g, "");
  const cleanExt = ext.trim().replace(/^\.+/, "").toLowerCase() || "webp";

  if (!cleanUserId || !cleanDreamId) {
    throw new Error("userId dan dreamId wajib diisi untuk membuat path foto Memoire.");
  }

  return `${cleanUserId}/${cleanDreamId}/${Date.now()}.${cleanExt}`;
}

/**
 * Membuat signed URL secara batch untuk merender foto dari private bucket `memoire-photos`.
 * Mengabaikan path kosong/duplikat dan tidak mematahkan render jika salah satu objek tidak ditemukan.
 */
export async function createMemoireSignedUrls(
  supabase: SupabaseClient<Database>,
  paths: readonly (string | null | undefined)[],
  expiresIn = 3600
): Promise<Record<string, string>> {
  const uniquePaths = Array.from(
    new Set(
      paths
        .filter((path): path is string => typeof path === "string")
        .map((path) => path.trim())
        .filter((path) => path.length > 0)
    )
  );

  if (uniquePaths.length === 0) {
    return {};
  }

  const safeExpiresIn = Math.max(1, Math.floor(expiresIn));
  const { data, error } = await supabase.storage
    .from(MEMOIRE_BUCKET)
    .createSignedUrls(uniquePaths, safeExpiresIn);

  if (error || !data) {
    return {};
  }

  const signedUrlMap: Record<string, string> = {};
  for (const item of data) {
    if (!item.error && item.path && item.signedUrl) {
      signedUrlMap[item.path] = item.signedUrl;
    }
  }

  return signedUrlMap;
}
