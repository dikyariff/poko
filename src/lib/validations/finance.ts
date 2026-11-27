import { z } from "zod";

export const MAX_FINANCE_AMOUNT = 999_999_999_999;

export const WALLET_TYPE_VALUES = ["bank", "ewallet", "cash", "savings"] as const;
export type WalletType = (typeof WALLET_TYPE_VALUES)[number];

export const TRANSACTION_TYPE_VALUES = ["income", "expense", "transfer"] as const;
export type TransactionType = (typeof TRANSACTION_TYPE_VALUES)[number];

export const TRANSACTION_SOURCE_VALUES = [
  "manual",
  "receipt_ai",
  "savings_sync",
  "dream_execution",
] as const;
export type TransactionSource = (typeof TRANSACTION_SOURCE_VALUES)[number];

export interface PokoWalletTypeOption {
  value: WalletType;
  label: string;
  emoji: string;
  icon: string;
  defaultColor: string;
  description: string;
}

export const POKO_WALLET_TYPES: readonly PokoWalletTypeOption[] = [
  {
    value: "bank",
    label: "Bank",
    emoji: "🏦",
    icon: "landmark",
    defaultColor: "#5CE1FF",
    description: "Rekening bank utama untuk gaji, transfer, dan transaksi harian.",
  },
  {
    value: "ewallet",
    label: "E-Wallet",
    emoji: "📱",
    icon: "smartphone",
    defaultColor: "#C8FF3D",
    description: "Dompet digital seperti GoPay, OVO, Dana, atau ShopeePay.",
  },
  {
    value: "cash",
    label: "Tunai",
    emoji: "💵",
    icon: "banknote",
    defaultColor: "#FFE14D",
    description: "Uang cash di dompet fisik untuk jajan dan kebutuhan harian.",
  },
  {
    value: "savings",
    label: "Tabungan",
    emoji: "🐷",
    icon: "piggy-bank",
    defaultColor: "#7CFFB2",
    description: "Kantong tabungan khusus yang terhubung dengan Dream Planner.",
  },
] as const;

export interface PokoCategoryOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const POKO_EXPENSE_CATEGORIES: readonly PokoCategoryOption[] = [
  { id: "makan", label: "Makan", emoji: "🍜", color: "#FFE14D" },
  { id: "kopi", label: "Kopi & Jajan", emoji: "☕", color: "#FFB87A" },
  { id: "transport", label: "Transport", emoji: "🛵", color: "#5CE1FF" },
  { id: "belanja", label: "Belanja", emoji: "🛍️", color: "#FF6B8B" },
  { id: "hiburan", label: "Hiburan", emoji: "🎮", color: "#D6B8FF" },
  { id: "tagihan", label: "Tagihan", emoji: "⚡", color: "#8CF0C5" },
  { id: "kesehatan", label: "Kesehatan", emoji: "💊", color: "#FCA5A5" },
  { id: "tabungan", label: "Tabungan / Impian", emoji: "🎯", color: "#7CFFB2" },
  { id: "lainnya", label: "Lainnya", emoji: "📦", color: "#E2E8F0" },
] as const;

export const POKO_INCOME_CATEGORIES: readonly PokoCategoryOption[] = [
  { id: "gaji", label: "Gaji / Cuan", emoji: "💼", color: "#C8FF3D" },
  { id: "bonus", label: "Side Hustle", emoji: "✨", color: "#7CFFB2" },
  { id: "hadiah", label: "Hadiah / Cashback", emoji: "🎁", color: "#FFE14D" },
  { id: "investasi", label: "Investasi", emoji: "📈", color: "#5CE1FF" },
  { id: "tabungan", label: "Tabungan / Impian", emoji: "🎯", color: "#7CFFB2" },
  { id: "lainnya", label: "Lainnya", emoji: "🪙", color: "#E2E8F0" },
] as const;

export const POKO_TRANSFER_CATEGORY: PokoCategoryOption = {
  id: "transfer",
  label: "Transfer",
  emoji: "⇄",
  color: "#5CE1FF",
} as const;

export const POKO_STARTER_WALLETS = [
  {
    name: "Tabungan Utama",
    wallet_type: "savings" as WalletType,
    balance: 0,
    color: "#7CFFB2",
    icon: "piggy-bank",
    is_primary_savings: true,
    sort_order: 1,
  },
] as const;

export type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export function formatZodActionError(
  error: z.ZodError,
  fallbackMessage = "Periksa kembali data yang kamu masukkan."
): { error: string; fieldErrors?: Record<string, string[]> } {
  const flattened = z.flattenError(error);
  const fieldErrors: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[key] = messages;
    }
  }

  const firstFieldMessage = Object.values(fieldErrors)[0]?.[0];
  const firstFormMessage = flattened.formErrors[0];

  return {
    error: firstFormMessage ?? firstFieldMessage ?? fallbackMessage,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value: string): boolean {
  if (ISO_DATE_ONLY_REGEX.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }

  return !Number.isNaN(Date.parse(value));
}

function emptyStringToNull(value: unknown): unknown {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  return value;
}

function emptyOrAllToUndefined(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed.toLowerCase() === "all") {
      return undefined;
    }
    return trimmed;
  }
  return value;
}

const walletTypeSchema = z.enum(WALLET_TYPE_VALUES, {
  error: "Tipe dompet harus berupa bank, ewallet, cash, atau savings.",
});

const hexColorSchema = z
  .string({ error: "Warna dompet harus berupa kode hex." })
  .trim()
  .regex(HEX_COLOR_REGEX, "Format warna harus hex 6 digit, misalnya #FDE047.");

const walletIconSchema = z
  .string({ error: "Ikon dompet harus berupa teks." })
  .trim()
  .min(1, "Ikon dompet tidak boleh kosong.")
  .max(32, "Nama ikon dompet maksimal 32 karakter.");

const sortOrderSchema = z
  .number({ error: "Urutan dompet harus berupa angka." })
  .int("Urutan dompet harus berupa bilangan bulat.")
  .min(0, "Urutan dompet minimal 0.")
  .max(9999, "Urutan dompet maksimal 9999.");

const occurredAtSchema = z
  .string({ error: "Tanggal transaksi harus berupa string ISO." })
  .trim()
  .refine(isValidDateString, "Format tanggal transaksi tidak valid.");

// =============================================================================
// Wallet Schemas
// =============================================================================

export const createWalletSchema = z
  .object({
    name: z
      .string({ error: "Nama dompet wajib diisi." })
      .trim()
      .min(1, "Nama dompet wajib diisi.")
      .max(60, "Nama dompet maksimal 60 karakter."),
    wallet_type: walletTypeSchema.default("cash"),
    balance: z
      .number({ error: "Saldo awal harus berupa angka." })
      .int("Saldo awal harus berupa bilangan bulat.")
      .min(0, "Saldo awal tidak boleh negatif.")
      .max(MAX_FINANCE_AMOUNT, "Saldo awal melebihi batas maksimum.")
      .default(0),
    color: hexColorSchema.default("#FDE047"),
    icon: walletIconSchema.default("wallet"),
    is_primary_savings: z.boolean().default(false),
    sort_order: sortOrderSchema.default(0),
  })
  .superRefine((data, ctx) => {
    if (data.is_primary_savings && data.wallet_type !== "savings") {
      ctx.addIssue({
        code: "custom",
        path: ["is_primary_savings"],
        message: "Hanya dompet bertipe Tabungan yang bisa dijadikan Tabungan Utama.",
      });
    }
  });

export const updateWalletSchema = z
  .object({
    id: z.uuid({ error: "ID dompet tidak valid." }),
    name: z
      .string({ error: "Nama dompet harus berupa teks." })
      .trim()
      .min(1, "Nama dompet wajib diisi.")
      .max(60, "Nama dompet maksimal 60 karakter.")
      .optional(),
    wallet_type: walletTypeSchema.optional(),
    color: hexColorSchema.optional(),
    icon: walletIconSchema.optional(),
    sort_order: sortOrderSchema.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.wallet_type !== undefined ||
      data.color !== undefined ||
      data.icon !== undefined ||
      data.sort_order !== undefined,
    {
      message: "Pilih minimal satu kolom dompet yang ingin diperbarui.",
    }
  );

export const archiveWalletSchema = z.object({
  id: z.uuid({ error: "ID dompet tidak valid." }),
  is_archived: z.boolean().default(true),
});

export const setPrimarySavingsSchema = z.object({
  id: z.uuid({ error: "ID dompet tidak valid." }),
});

// =============================================================================
// Transaction Schemas
// =============================================================================

export const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPE_VALUES, {
      error: "Tipe transaksi harus income, expense, atau transfer.",
    }),
    amount: z
      .number({ error: "Nominal transaksi harus berupa angka." })
      .int("Nominal transaksi harus berupa bilangan bulat.")
      .positive("Nominal transaksi harus lebih dari Rp 0.")
      .max(MAX_FINANCE_AMOUNT, "Nominal transaksi melebihi batas maksimum."),
    wallet_id: z.uuid({ error: "Dompet asal tidak valid." }),
    destination_wallet_id: z.preprocess(
      emptyStringToNull,
      z.uuid({ error: "Dompet tujuan tidak valid." }).nullable().optional()
    ),
    category: z.preprocess(
      emptyStringToNull,
      z
        .string({ error: "Kategori harus berupa teks." })
        .trim()
        .min(1, "Kategori tidak boleh kosong.")
        .max(50, "Kategori maksimal 50 karakter.")
        .nullable()
        .optional()
    ),
    note: z
      .string({ error: "Catatan harus berupa teks." })
      .trim()
      .max(280, "Catatan maksimal 280 karakter.")
      .default(""),
    merchant: z.preprocess(
      emptyStringToNull,
      z
        .string({ error: "Nama merchant harus berupa teks." })
        .trim()
        .min(1, "Nama merchant tidak boleh kosong.")
        .max(120, "Nama merchant maksimal 120 karakter.")
        .nullable()
        .optional()
    ),
    occurred_at: z.preprocess(emptyStringToNull, occurredAtSchema.nullable().optional()),
    source: z
      .enum(TRANSACTION_SOURCE_VALUES, {
        error: "Sumber transaksi tidak valid.",
      })
      .default("manual"),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer") {
      if (!data.destination_wallet_id) {
        ctx.addIssue({
          code: "custom",
          path: ["destination_wallet_id"],
          message: "Dompet tujuan wajib dipilih untuk transaksi transfer.",
        });
      } else if (data.destination_wallet_id === data.wallet_id) {
        ctx.addIssue({
          code: "custom",
          path: ["destination_wallet_id"],
          message: "Dompet tujuan tidak boleh sama dengan dompet asal.",
        });
      }
    } else if (data.destination_wallet_id) {
      ctx.addIssue({
        code: "custom",
        path: ["destination_wallet_id"],
        message: "Dompet tujuan hanya boleh diisi untuk transaksi transfer.",
      });
    }
  });

export const deleteTransactionSchema = z.object({
  id: z.uuid({ error: "ID transaksi tidak valid." }),
});

export const transactionFilterSchema = z
  .object({
    search: z.preprocess(
      emptyStringToNull,
      z
        .string({ error: "Kata kunci pencarian harus berupa teks." })
        .trim()
        .max(100, "Kata kunci pencarian maksimal 100 karakter.")
        .nullable()
        .optional()
    ),
    type: z.enum(["all", ...TRANSACTION_TYPE_VALUES]).optional(),
    walletId: z.preprocess(
      emptyOrAllToUndefined,
      z.uuid({ error: "Filter dompet tidak valid." }).optional()
    ),
    category: z.preprocess(
      emptyOrAllToUndefined,
      z
        .string({ error: "Filter kategori harus berupa teks." })
        .trim()
        .max(50, "Filter kategori maksimal 50 karakter.")
        .optional()
    ),
    from: z.preprocess(emptyStringToNull, occurredAtSchema.nullable().optional()),
    to: z.preprocess(emptyStringToNull, occurredAtSchema.nullable().optional()),
    limit: z
      .number({ error: "Batas jumlah transaksi harus berupa angka." })
      .int("Batas jumlah transaksi harus berupa bilangan bulat.")
      .min(1, "Batas jumlah transaksi minimal 1.")
      .max(200, "Batas jumlah transaksi maksimal 200.")
      .default(50),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to) {
      const fromTime = Date.parse(data.from);
      const toTime = Date.parse(data.to);
      if (!Number.isNaN(fromTime) && !Number.isNaN(toTime) && fromTime > toTime) {
        ctx.addIssue({
          code: "custom",
          path: ["to"],
          message: "Tanggal akhir tidak boleh lebih awal dari tanggal mulai.",
        });
      }
    }
  });

// =============================================================================
// Inferred Types
// =============================================================================

export type CreateWalletInput = z.input<typeof createWalletSchema>;
export type CreateWalletData = z.output<typeof createWalletSchema>;

export type UpdateWalletInput = z.input<typeof updateWalletSchema>;
export type UpdateWalletData = z.output<typeof updateWalletSchema>;

export type ArchiveWalletInput = z.input<typeof archiveWalletSchema>;
export type ArchiveWalletData = z.output<typeof archiveWalletSchema>;

export type SetPrimarySavingsInput = z.input<typeof setPrimarySavingsSchema>;
export type SetPrimarySavingsData = z.output<typeof setPrimarySavingsSchema>;

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
export type CreateTransactionData = z.output<typeof createTransactionSchema>;

export type DeleteTransactionInput = z.input<typeof deleteTransactionSchema>;
export type DeleteTransactionData = z.output<typeof deleteTransactionSchema>;

export type TransactionFilterInput = z.input<typeof transactionFilterSchema>;
export type TransactionFilterData = z.output<typeof transactionFilterSchema>;
