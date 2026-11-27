"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { isClerkServerConfigured } from "@/lib/clerk-config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient, type TypedSupabaseClient } from "@/lib/supabase/server";
import {
  createTransactionSchema,
  deleteTransactionSchema,
  formatZodActionError,
  transactionFilterSchema,
  type ActionResult,
  type CreateTransactionInput,
  type DeleteTransactionInput,
  type TransactionFilterInput,
} from "@/lib/validations/finance";
import type { Json, Transaction, Wallet } from "@/types/database";

export type { ActionResult };

export type TransactionWalletSummary = Pick<
  Wallet,
  "id" | "name" | "wallet_type" | "color" | "icon"
>;

export type TransactionWithWallets = Transaction & {
  wallet: TransactionWalletSummary | null;
  destination_wallet: TransactionWalletSummary | null;
};

interface AuthenticatedTransactionContext {
  userId: string;
  supabase: TypedSupabaseClient;
}

interface PostgresRpcError {
  code?: string;
  message?: string;
  details?: string | null;
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function revalidateTransactionRoutes(): void {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/dreams");
  revalidatePath("/dashboard/reports");
}

async function getAuthenticatedTransactionContext(): Promise<
  { ok: true; context: AuthenticatedTransactionContext } | { ok: false; error: string }
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
      error: "Sesi login tidak ditemukan. Silakan masuk kembali untuk mengelola transaksi.",
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

function normalizeDateBoundary(value: string, boundary: "start" | "end"): string {
  if (DATE_ONLY_REGEX.test(value)) {
    return boundary === "start" ? `${value}T00:00:00.000+07:00` : `${value}T23:59:59.999+07:00`;
  }

  return new Date(value).toISOString();
}

function sanitizePostgrestSearch(raw: string): string {
  // Hapus karakter pemisah filter PostgREST agar `.or(...)` aman dan tidak error syntax
  return raw
    .replace(/[,()%*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapTransactionRpcError(
  error: PostgresRpcError | null | undefined,
  action: "create" | "delete" | "read"
): string {
  const code = error?.code ?? "";
  const message = error?.message ?? "";

  if (code === "42501") {
    return "Sesi login tidak valid atau telah berakhir. Silakan masuk kembali.";
  }

  if (code === "P0001") {
    if (message.includes("Saldo dompet")) {
      return message;
    }
    return action === "delete"
      ? "Saldo dompet saat ini tidak cukup untuk membatalkan transaksi ini."
      : "Saldo dompet tidak mencukupi untuk transaksi ini.";
  }

  if (code === "P0002") {
    if (message.includes("Dompet asal")) {
      return "Dompet asal tidak ditemukan atau sudah diarsipkan.";
    }
    if (message.includes("Dompet tujuan")) {
      return "Dompet tujuan tidak ditemukan atau sudah diarsipkan.";
    }
    if (message.includes("Transaksi tidak ditemukan")) {
      return "Transaksi tidak ditemukan atau sudah dihapus.";
    }
    return "Dompet atau transaksi terkait tidak ditemukan.";
  }

  if (code === "22023") {
    if (message.includes("Dompet tujuan wajib")) {
      return "Dompet tujuan wajib dipilih untuk transaksi transfer.";
    }
    if (message.includes("tidak boleh sama")) {
      return "Dompet asal dan dompet tujuan tidak boleh sama.";
    }
    if (message.includes("Nominal transaksi")) {
      return "Nominal transaksi harus lebih dari Rp 0.";
    }
    if (message.includes("Sumber transaksi")) {
      return "Sumber transaksi tidak dikenali.";
    }
    if (message.includes("Tipe transaksi")) {
      return "Tipe transaksi tidak valid.";
    }
    return "Data transaksi tidak valid. Periksa kembali isianmu.";
  }

  if (code === "22P02") {
    return "Format ID atau data transaksi tidak valid.";
  }

  if (action === "read") {
    return "Gagal memuat riwayat transaksi dari database. Silakan coba lagi.";
  }

  return action === "delete"
    ? "Gagal menghapus transaksi secara atomik. Silakan coba lagi beberapa saat."
    : "Gagal mencatat transaksi secara atomik. Silakan coba lagi beberapa saat.";
}

/**
 * Mengambil riwayat transaksi milik user aktif dengan filter opsional
 * (tipe, dompet asal/tujuan, kategori, pencarian teks, rentang tanggal, dan limit)
 * beserta join ringan nama/ikon/warna dompet asal & tujuan.
 */
export async function getTransactions(
  filters?: TransactionFilterInput
): Promise<ActionResult<TransactionWithWallets[]>> {
  const parsed = transactionFilterSchema.safeParse(filters ?? {});
  if (!parsed.success) {
    return {
      ok: false,
      ...formatZodActionError(parsed.error, "Parameter filter transaksi tidak valid."),
    };
  }

  const authResult = await getAuthenticatedTransactionContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { userId, supabase } = authResult.context;
  const { search, type, walletId, category, from, to, limit } = parsed.data;

  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        wallet:wallets!transactions_wallet_id_fkey(id, name, wallet_type, color, icon),
        destination_wallet:wallets!transactions_destination_wallet_id_fkey(id, name, wallet_type, color, icon)
      `
      )
      .eq("user_id", userId);

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (walletId) {
      query = query.or(`wallet_id.eq.${walletId},destination_wallet_id.eq.${walletId}`);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (from) {
      query = query.gte("occurred_at", normalizeDateBoundary(from, "start"));
    }

    if (to) {
      query = query.lte("occurred_at", normalizeDateBoundary(to, "end"));
    }

    if (search) {
      const cleanSearch = sanitizePostgrestSearch(search);
      if (cleanSearch.length > 0) {
        query = query.or(
          `note.ilike.%${cleanSearch}%,merchant.ilike.%${cleanSearch}%,category.ilike.%${cleanSearch}%`
        );
      }
    }

    const { data, error } = await query
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error("[poko/transactions] Failed to fetch transactions:", error?.message);
      return {
        ok: false,
        error: mapTransactionRpcError(error, "read"),
      };
    }

    const normalized: TransactionWithWallets[] = data.map((row) => ({
      ...row,
      wallet: Array.isArray(row.wallet) ? (row.wallet[0] ?? null) : (row.wallet ?? null),
      destination_wallet: Array.isArray(row.destination_wallet)
        ? (row.destination_wallet[0] ?? null)
        : (row.destination_wallet ?? null),
    }));

    return {
      ok: true,
      data: normalized,
    };
  } catch (error) {
    console.error(
      "[poko/transactions] Unexpected error fetching transactions:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database bermasalah. Gagal memuat riwayat transaksi.",
    };
  }
}

/**
 * Mencatat transaksi baru secara atomik melalui PostgreSQL RPC `public.create_transaction`.
 * Saldo dompet (dan `monthly_budget_logs` untuk expense) diperbarui dalam satu transaksi database.
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<ActionResult<Transaction>> {
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      ...formatZodActionError(parsed.error, "Data transaksi belum valid."),
    };
  }

  const authResult = await getAuthenticatedTransactionContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { supabase } = authResult.context;
  const payload = parsed.data;

  const resolvedCategory =
    payload.category ?? (payload.type === "transfer" ? "Transfer" : "Lainnya");
  const resolvedOccurredAt = payload.occurred_at
    ? normalizeDateBoundary(payload.occurred_at, "start")
    : undefined;

  try {
    const { data, error } = await supabase.rpc("create_transaction", {
      p_type: payload.type,
      p_amount: payload.amount,
      p_wallet_id: payload.wallet_id,
      p_destination_wallet_id:
        payload.type === "transfer" ? (payload.destination_wallet_id ?? undefined) : undefined,
      p_category: resolvedCategory,
      p_note: payload.note,
      p_merchant: payload.merchant ?? undefined,
      p_occurred_at: resolvedOccurredAt,
      p_source: payload.source,
      p_metadata: payload.metadata as Json,
    });

    if (error || !data) {
      console.error(
        "[poko/transactions] RPC create_transaction failed:",
        error?.code,
        error?.message
      );
      return {
        ok: false,
        error: mapTransactionRpcError(error, "create"),
      };
    }

    revalidateTransactionRoutes();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(
      "[poko/transactions] Unexpected error calling create_transaction RPC:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database bermasalah. Transaksi belum tersimpan.",
    };
  }
}

/**
 * Menghapus transaksi secara atomik melalui PostgreSQL RPC `public.delete_transaction`.
 * Otomatis mengembalikan saldo dompet terkait serta menyesuaikan `monthly_budget_logs`.
 */
export async function deleteTransaction(
  input: DeleteTransactionInput
): Promise<ActionResult<Transaction>> {
  const parsed = deleteTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      ...formatZodActionError(parsed.error, "ID transaksi tidak valid."),
    };
  }

  const authResult = await getAuthenticatedTransactionContext();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const { supabase } = authResult.context;

  try {
    const { data, error } = await supabase.rpc("delete_transaction", {
      p_transaction_id: parsed.data.id,
    });

    if (error || !data) {
      console.error(
        "[poko/transactions] RPC delete_transaction failed:",
        error?.code,
        error?.message
      );
      return {
        ok: false,
        error: mapTransactionRpcError(error, "delete"),
      };
    }

    revalidateTransactionRoutes();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(
      "[poko/transactions] Unexpected error calling delete_transaction RPC:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      error: "Koneksi ke database bermasalah. Transaksi belum terhapus.",
    };
  }
}
