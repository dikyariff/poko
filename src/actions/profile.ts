"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  DEFAULT_BLOBATAR_MOOD,
  deriveClerkBlobatarSeed,
  normalizeBlobatarFrame,
  normalizeDisplayName,
  normalizeHandle,
  validateBlobatarProfileInput,
  type BlobatarProfileField,
  type BlobatarProfileInput,
  type BlobatarProfileRecord,
} from "@/lib/blobatar";
import { isClerkServerConfigured } from "@/lib/clerk-config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type UpdateBlobatarProfileResult =
  | {
      ok: true;
      profile: BlobatarProfileRecord;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<BlobatarProfileField, string>>;
    };

/**
 * Server Action untuk memvalidasi dan menyimpan profil user (nama tampilan, handle, bingkai)
 * ke tabel `public.profiles` di Supabase dengan RLS Clerk (`auth.jwt() ->> 'sub'`).
 * Seed Blobatar selalu diturunkan otomatis dari profil Clerk (1 user = 1 avatar unik).
 */
export async function updateBlobatarProfile(
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

  if (!isClerkServerConfigured()) {
    return {
      ok: false,
      error: "Autentikasi Clerk belum dikonfigurasi pada server.",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      error: "Sesi login tidak ditemukan. Silakan masuk kembali untuk menyimpan profil.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Supabase belum terkonfigurasi. Tambahkan env Supabase agar profil tersimpan.",
    };
  }

  try {
    const clerkUser = await currentUser().catch(() => null);
    const clerkSeed = deriveClerkBlobatarSeed({
      id: userId,
      username: clerkUser?.username ?? null,
      email: clerkUser?.primaryEmailAddress?.emailAddress ?? null,
    });

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          display_name: validated.data.display_name,
          handle: validated.data.handle,
          blobatar_seed: clerkSeed,
          blobatar_mood: DEFAULT_BLOBATAR_MOOD,
          blobatar_frame: validated.data.blobatar_frame,
        },
        { onConflict: "id" }
      )
      .select("id, display_name, handle, blobatar_frame, privacy_mode")
      .single();

    if (error || !data) {
      console.error("[poko/profile] Failed to update Blobatar profile:", error?.message);
      return {
        ok: false,
        error: "Gagal menyimpan perubahan profil ke database. Coba lagi beberapa saat.",
      };
    }

    const savedProfile: BlobatarProfileRecord = {
      id: data.id,
      display_name: normalizeDisplayName(data.display_name),
      handle: normalizeHandle(data.handle),
      blobatar_seed: clerkSeed,
      blobatar_frame: normalizeBlobatarFrame(data.blobatar_frame),
      privacy_mode: Boolean(data.privacy_mode),
    };

    revalidatePath("/dashboard", "layout");

    return {
      ok: true,
      profile: savedProfile,
    };
  } catch (error) {
    console.error(
      "[poko/profile] Unexpected error updating Blobatar profile:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database sedang bermasalah. Perubahan belum tersimpan.",
    };
  }
}
