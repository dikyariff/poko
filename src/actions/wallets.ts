"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { isClerkServerConfigured } from "@/lib/clerk-config";
import { getOrCreateProfile } from "@/lib/profile-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient, type TypedSupabaseClient } from "@/lib/supabase/server";
import {
  archiveWalletSchema,
  createWalletSchema,
  formatZodActionError,
  POKO_STARTER_WALLETS,
  setPrimarySavingsSchema,
  updateWalletSchema,
  type ActionResult,
  type ArchiveWalletInput,
  type CreateWalletInput,
  type SetPrimarySavingsInput,
  type UpdateWalletInput,
} from "@/lib/validations/finance";
import type { Wallet, WalletUpdate } from "@/types/database";

export type { ActionResult };

interface AuthenticatedWalletContext {
  userId: string;
  supabase: TypedSupabaseClient;
}

interface PostgresLikeError {
  code?: string;
  message?: string;
  details?: string | null;
}

function revalidateWalletRoutes(): void {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/dreams");
  revalidatePath("/dashboard/reports");
}

function tryRevalidateWalletRoutes(): void {
  try {
    revalidateWalletRoutes();
  } catch {
    // Aman bila ensureStarterWallets dipanggil saat initial Server Component render
  }
}

async function getAuthenticatedWalletContext(): Promise<
  { ok: true; context: AuthenticatedWalletContext } | { ok: false; error: string }
> {
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
      error: "Sesi login tidak ditemukan. Silakan masuk kembali untuk mengakses dompet.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Supabase belum terkonfigurasi. Tambahkan env Supabase terlebih dahulu.",
    };
  }

  const supabase = await createServerSupabaseClient();
  return {
    ok: true,
    context: { userId, supabase },
  };
}

function mapWalletPostgresError(error: PostgresLikeError | null | undefined): string {
  const code = error?.code ?? "";
  const message = error?.message ?? "";

  if (code === "42501") {
    return "Kamu tidak memiliki izin untuk mengubah dompet ini. Silakan masuk ulang.";
  }

  if (code === "23505" || message.includes("idx_wallets_one_primary_savings_per_user")) {
    return "Sudah ada dompet yang ditandai sebagai Tabungan Utama. Coba simpan ulang dalam beberapa saat.";
  }

  if (code === "23503") {
    return "Profil akun belum tersinkronisasi di database. Muat ulang halaman lalu coba lagi.";
  }

  if (code === "22P02") {
    return "Format ID atau data dompet tidak valid.";
  }

  return "Gagal memproses data dompet di database. Silakan coba lagi beberapa saat.";
}

async function fetchUserWallets(
  supabase: TypedSupabaseClient,
  userId: string,
  includeArchived = false
): Promise<{ data: Wallet[] | null; error: PostgresLikeError | null }> {
  let query = supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Mengambil daftar dompet milik user Clerk yang sedang login.
 * Secara default hanya mengembalikan dompet aktif (`is_archived = false`).
 */
export async function getWallets(options?: {
  includeArchived?: boolean;
}): Promise<ActionResult<Wallet[]>> {
  const authResult = await getAuthenticatedWalletContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { userId, supabase } = authResult.context;

  try {
    const { data, error } = await fetchUserWallets(
      supabase,
      userId,
      Boolean(options?.includeArchived)
    );

    if (error || !data) {
      console.error("[poko/wallets] Failed to fetch wallets:", error?.message);
      return {
        ok: false,
        error: mapWalletPostgresError(error),
      };
    }

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(
      "[poko/wallets] Unexpected error fetching wallets:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database sedang bermasalah. Gagal memuat daftar dompet.",
    };
  }
}

/**
 * Memastikan user memiliki dompet bawaan Poko (`Tabungan Utama`).
 * Idempotent: jika user sudah memiliki minimal 1 dompet (aktif atau arsip), tidak membuat duplikat.
 */
export async function ensureStarterWallets(): Promise<ActionResult<Wallet[]>> {
  const authResult = await getAuthenticatedWalletContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { userId, supabase } = authResult.context;

  try {
    const profileResult = await getOrCreateProfile({ userId });
    if (!profileResult.persisted) {
      return {
        ok: false,
        error: "Gagal menyinkronkan profil akun sebelum menyiapkan dompet awal.",
      };
    }

    const { data: anyExisting, error: checkError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (checkError) {
      console.error("[poko/wallets] Failed to check existing wallets:", checkError.message);
      return {
        ok: false,
        error: mapWalletPostgresError(checkError),
      };
    }

    if (anyExisting && anyExisting.length > 0) {
      const { data: activeWallets, error: fetchError } = await fetchUserWallets(
        supabase,
        userId,
        false
      );

      if (fetchError || !activeWallets) {
        console.error("[poko/wallets] Failed to load active wallets:", fetchError?.message);
        return {
          ok: false,
          error: mapWalletPostgresError(fetchError),
        };
      }

      return {
        ok: true,
        data: activeWallets,
      };
    }

    const starterRows = POKO_STARTER_WALLETS.map((wallet) => ({
      user_id: userId,
      name: wallet.name,
      wallet_type: wallet.wallet_type,
      balance: wallet.balance,
      color: wallet.color,
      icon: wallet.icon,
      is_primary_savings: wallet.is_primary_savings,
      is_archived: false,
      sort_order: wallet.sort_order,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("wallets")
      .insert(starterRows)
      .select("*")
      .order("sort_order", { ascending: true });

    if (insertError) {
      // Idempotency guard untuk request paralel yang sama-sama memicu unique index primary savings
      if (insertError.code === "23505") {
        const { data: existingAfterRace, error: retryError } = await fetchUserWallets(
          supabase,
          userId,
          false
        );

        if (!retryError && existingAfterRace) {
          return {
            ok: true,
            data: existingAfterRace,
          };
        }
      }

      console.error("[poko/wallets] Failed to insert starter wallets:", insertError.message);
      return {
        ok: false,
        error: mapWalletPostgresError(insertError),
      };
    }

    tryRevalidateWalletRoutes();

    return {
      ok: true,
      data: inserted ?? [],
    };
  } catch (error) {
    console.error(
      "[poko/wallets] Unexpected error ensuring starter wallets:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Terjadi kendala koneksi saat menyiapkan dompet awal Poko.",
    };
  }
}

/**
 * Membuat dompet baru untuk user aktif.
 * Menjamin row `profiles` sudah ada sebelum insert dan menjaga konsistensi `is_primary_savings`.
 */
export async function createWallet(input: CreateWalletInput): Promise<ActionResult<Wallet>> {
  const parsed = createWalletSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      ...formatZodActionError(parsed.error, "Data dompet baru belum valid."),
    };
  }

  const authResult = await getAuthenticatedWalletContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { userId, supabase } = authResult.context;
  const payload = parsed.data;

  try {
    const profileResult = await getOrCreateProfile({ userId });
    if (!profileResult.persisted) {
      return {
        ok: false,
        error: "Profil akun belum siap di database. Coba muat ulang lalu simpan dompet lagi.",
      };
    }

    let previousPrimaryId: string | null = null;

    if (payload.is_primary_savings) {
      const { data: currentPrimary, error: lookupError } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", userId)
        .eq("is_primary_savings", true)
        .maybeSingle();

      if (lookupError) {
        console.error(
          "[poko/wallets] Failed to inspect current primary savings wallet:",
          lookupError.message
        );
        return {
          ok: false,
          error: mapWalletPostgresError(lookupError),
        };
      }

      if (currentPrimary) {
        previousPrimaryId = currentPrimary.id;
        const { error: clearError } = await supabase
          .from("wallets")
          .update({ is_primary_savings: false })
          .eq("id", currentPrimary.id)
          .eq("user_id", userId);

        if (clearError) {
          console.error(
            "[poko/wallets] Failed to clear existing primary savings flag:",
            clearError.message
          );
          return {
            ok: false,
            error: mapWalletPostgresError(clearError),
          };
        }
      }
    }

    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
        name: payload.name,
        wallet_type: payload.wallet_type,
        balance: payload.balance,
        color: payload.color,
        icon: payload.icon,
        is_primary_savings: payload.is_primary_savings,
        is_archived: false,
        sort_order: payload.sort_order,
      })
      .select("*")
      .single();

    if (error || !data) {
      // Kembalikan flag Tabungan Utama lama jika insert gagal
      if (previousPrimaryId) {
        await supabase
          .from("wallets")
          .update({ is_primary_savings: true })
          .eq("id", previousPrimaryId)
          .eq("user_id", userId);
      }

      console.error("[poko/wallets] Failed to create wallet:", error?.message);
      return {
        ok: false,
        error: mapWalletPostgresError(error),
      };
    }

    revalidateWalletRoutes();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(
      "[poko/wallets] Unexpected error creating wallet:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database bermasalah. Dompet baru belum tersimpan.",
    };
  }
}

/**
 * Memperbarui metadata dompet (nama, tipe, warna, ikon, urutan).
 * Saldo dompet tidak diubah langsung di sini; mutasi saldo selalu lewat RPC transaksi atomik.
 */
export async function updateWallet(input: UpdateWalletInput): Promise<ActionResult<Wallet>> {
  const parsed = updateWalletSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      ...formatZodActionError(parsed.error, "Perubahan data dompet belum valid."),
    };
  }

  const authResult = await getAuthenticatedWalletContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { userId, supabase } = authResult.context;
  const { id, name, wallet_type, color, icon, sort_order } = parsed.data;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("[poko/wallets] Failed to fetch wallet before update:", fetchError.message);
      return {
        ok: false,
        error: mapWalletPostgresError(fetchError),
      };
    }

    if (!existing) {
      return {
        ok: false,
        error: "Dompet tidak ditemukan atau bukan milik akun kamu.",
      };
    }

    if (existing.is_primary_savings && wallet_type !== undefined && wallet_type !== "savings") {
      return {
        ok: false,
        error:
          "Tabungan Utama harus bertipe Tabungan. Pindahkan penanda Tabungan Utama ke dompet lain terlebih dahulu.",
        fieldErrors: {
          wallet_type: ["Pindahkan Tabungan Utama sebelum mengubah tipe dompet ini."],
        },
      };
    }

    const updatePayload: WalletUpdate = {};
    if (name !== undefined) updatePayload.name = name;
    if (wallet_type !== undefined) updatePayload.wallet_type = wallet_type;
    if (color !== undefined) updatePayload.color = color;
    if (icon !== undefined) updatePayload.icon = icon;
    if (sort_order !== undefined) updatePayload.sort_order = sort_order;

    const { data, error } = await supabase
      .from("wallets")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[poko/wallets] Failed to update wallet:", error?.message);
      return {
        ok: false,
        error: mapWalletPostgresError(error),
      };
    }

    revalidateWalletRoutes();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(
      "[poko/wallets] Unexpected error updating wallet:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database bermasalah. Perubahan dompet belum tersimpan.",
    };
  }
}

/**
 * Mengarsipkan (soft-archive) atau memulihkan dompet tanpa menghapus histori transaksi.
 */
export async function archiveWallet(input: ArchiveWalletInput): Promise<ActionResult<Wallet>> {
  const parsed = archiveWalletSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      ...formatZodActionError(parsed.error, "Permintaan arsip dompet tidak valid."),
    };
  }

  const authResult = await getAuthenticatedWalletContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { userId, supabase } = authResult.context;
  const { id, is_archived } = parsed.data;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("[poko/wallets] Failed to fetch wallet before archive:", fetchError.message);
      return {
        ok: false,
        error: mapWalletPostgresError(fetchError),
      };
    }

    if (!existing) {
      return {
        ok: false,
        error: "Dompet tidak ditemukan atau bukan milik akun kamu.",
      };
    }

    const updatePayload: WalletUpdate = {
      is_archived,
      ...(is_archived && existing.is_primary_savings ? { is_primary_savings: false } : {}),
    };

    const { data, error } = await supabase
      .from("wallets")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[poko/wallets] Failed to archive wallet:", error?.message);
      return {
        ok: false,
        error: mapWalletPostgresError(error),
      };
    }

    revalidateWalletRoutes();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(
      "[poko/wallets] Unexpected error archiving wallet:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database bermasalah. Status arsip dompet belum berubah.",
    };
  }
}

/**
 * Memindahkan penanda `is_primary_savings` ke dompet bertipe `savings` pilihan user.
 * Mematuhi unique partial index `idx_wallets_one_primary_savings_per_user`.
 */
export async function setPrimarySavingsWallet(
  input: SetPrimarySavingsInput
): Promise<ActionResult<Wallet>> {
  const parsed = setPrimarySavingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      ...formatZodActionError(parsed.error, "ID dompet Tabungan Utama tidak valid."),
    };
  }

  const authResult = await getAuthenticatedWalletContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { userId, supabase } = authResult.context;
  const { id } = parsed.data;

  try {
    const { data: target, error: targetError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (targetError) {
      console.error("[poko/wallets] Failed to fetch target savings wallet:", targetError.message);
      return {
        ok: false,
        error: mapWalletPostgresError(targetError),
      };
    }

    if (!target || target.is_archived) {
      return {
        ok: false,
        error: "Dompet tabungan tidak ditemukan atau sudah diarsipkan.",
      };
    }

    if (target.wallet_type !== "savings") {
      return {
        ok: false,
        error: "Hanya dompet bertipe Tabungan yang bisa dipilih sebagai Tabungan Utama.",
      };
    }

    if (target.is_primary_savings) {
      return {
        ok: true,
        data: target,
      };
    }

    const { data: currentPrimary, error: primaryLookupError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .eq("is_primary_savings", true)
      .neq("id", id)
      .maybeSingle();

    if (primaryLookupError) {
      console.error(
        "[poko/wallets] Failed to look up existing primary savings wallet:",
        primaryLookupError.message
      );
      return {
        ok: false,
        error: mapWalletPostgresError(primaryLookupError),
      };
    }

    if (currentPrimary) {
      const { error: clearError } = await supabase
        .from("wallets")
        .update({ is_primary_savings: false })
        .eq("id", currentPrimary.id)
        .eq("user_id", userId);

      if (clearError) {
        console.error(
          "[poko/wallets] Failed to unset previous primary savings wallet:",
          clearError.message
        );
        return {
          ok: false,
          error: mapWalletPostgresError(clearError),
        };
      }
    }

    const { data: updated, error: promoteError } = await supabase
      .from("wallets")
      .update({ is_primary_savings: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (promoteError || !updated) {
      // Rollback penanda lama jika promosi dompet baru gagal
      if (currentPrimary) {
        await supabase
          .from("wallets")
          .update({ is_primary_savings: true })
          .eq("id", currentPrimary.id)
          .eq("user_id", userId);
      }

      console.error(
        "[poko/wallets] Failed to promote primary savings wallet:",
        promoteError?.message
      );
      return {
        ok: false,
        error: mapWalletPostgresError(promoteError),
      };
    }

    revalidateWalletRoutes();

    return {
      ok: true,
      data: updated,
    };
  } catch (error) {
    console.error(
      "[poko/wallets] Unexpected error setting primary savings wallet:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database bermasalah. Tabungan Utama belum diperbarui.",
    };
  }
}
