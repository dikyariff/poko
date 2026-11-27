import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";

import type { TransactionWithWallets } from "@/actions/transactions";
import {
  POKO_EXPENSE_CATEGORIES,
  POKO_INCOME_CATEGORIES,
  POKO_TRANSFER_CATEGORY,
  type PokoCategoryOption,
  type TransactionType,
} from "@/lib/validations/finance";

export const JAKARTA_TIME_ZONE = "Asia/Jakarta";

export type TransactionTypeFilter = "all" | TransactionType;
export type TransactionPeriodFilter = "all" | "today" | "7d" | "this_month" | "last_month";

export interface TransactionPeriodOption {
  value: TransactionPeriodFilter;
  label: string;
}

export const TRANSACTION_PERIOD_OPTIONS: readonly TransactionPeriodOption[] = [
  { value: "all", label: "Semua Waktu" },
  { value: "today", label: "Hari Ini" },
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "this_month", label: "Bulan Ini" },
  { value: "last_month", label: "Bulan Lalu" },
] as const;

export const TRANSACTION_AMOUNT_PRESETS = [
  { label: "15rb", amount: 15_000 },
  { label: "25rb", amount: 25_000 },
  { label: "50rb", amount: 50_000 },
  { label: "100rb", amount: 100_000 },
  { label: "250rb", amount: 250_000 },
] as const;

export interface CategoryFilterOption {
  value: string;
  label: string;
  emoji: string;
  group: "expense" | "income" | "transfer";
  matchKeys: string[];
}

function buildCategoryFilterOptions(): CategoryFilterOption[] {
  const seenLabels = new Set<string>();
  const options: CategoryFilterOption[] = [];

  const register = (item: PokoCategoryOption, group: "expense" | "income" | "transfer") => {
    const normalizedLabel = item.label.toLowerCase();
    if (seenLabels.has(normalizedLabel)) {
      return;
    }
    seenLabels.add(normalizedLabel);
    options.push({
      value: item.label,
      label: item.label,
      emoji: item.emoji,
      group,
      matchKeys: [item.id.toLowerCase(), normalizedLabel],
    });
  };

  for (const cat of POKO_EXPENSE_CATEGORIES) {
    register(cat, "expense");
  }
  for (const cat of POKO_INCOME_CATEGORIES) {
    register(cat, "income");
  }
  register(POKO_TRANSFER_CATEGORY, "transfer");

  return options;
}

export const TRANSACTION_FILTER_CATEGORIES: readonly CategoryFilterOption[] =
  buildCategoryFilterOptions();

const jakartaDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: JAKARTA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const wibTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const jakartaShortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const jakartaFullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const LOCAL_DATETIME_MIN_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const LOCAL_DATETIME_SEC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

function extractJakartaParts(date: Date): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
} {
  const parts = jakartaDatePartsFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  const rawHour = get("hour");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: rawHour === "24" ? "00" : rawHour,
    minute: get("minute"),
  };
}

export function getJakartaDateKey(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "invalid";
  }

  const { year, month, day } = extractJakartaParts(parsed);
  return `${year}-${month}-${day}`;
}

export function getJakartaNowDatetimeLocal(now = new Date()): string {
  const { year, month, day, hour, minute } = extractJakartaParts(now);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function toJakartaIsoString(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (LOCAL_DATETIME_MIN_REGEX.test(trimmed)) {
    return `${trimmed}:00+07:00`;
  }

  if (LOCAL_DATETIME_SEC_REGEX.test(trimmed)) {
    return `${trimmed}+07:00`;
  }

  return trimmed;
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return dateKey;
  }

  const shifted = new Date(Date.UTC(year, month - 1, day + deltaDays));
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatWibTime(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return `${wibTimeFormatter.format(parsed).replace(".", ":")} WIB`;
}

export function formatJakartaDateGroupHeader(
  dateKey: string,
  todayKey: string,
  yesterdayKey: string
): { primary: string; secondary: string | null } {
  if (dateKey === "invalid") {
    return { primary: "Tanggal Tidak Diketahui", secondary: null };
  }

  const anchor = new Date(`${dateKey}T12:00:00+07:00`);
  if (Number.isNaN(anchor.getTime())) {
    return { primary: dateKey, secondary: null };
  }

  if (dateKey === todayKey) {
    return {
      primary: "Hari Ini",
      secondary: jakartaShortDateFormatter.format(anchor),
    };
  }

  if (dateKey === yesterdayKey) {
    return {
      primary: "Kemarin",
      secondary: jakartaShortDateFormatter.format(anchor),
    };
  }

  return {
    primary: jakartaFullDateFormatter.format(anchor),
    secondary: null,
  };
}

export function matchesJakartaPeriod(
  occurredAt: string,
  period: TransactionPeriodFilter,
  todayKey: string
): boolean {
  if (period === "all") {
    return true;
  }

  const txKey = getJakartaDateKey(occurredAt);
  if (txKey === "invalid" || todayKey === "invalid") {
    return false;
  }

  if (period === "today") {
    return txKey === todayKey;
  }

  if (period === "7d") {
    const startKey = shiftDateKey(todayKey, -6);
    return txKey >= startKey && txKey <= todayKey;
  }

  if (period === "this_month") {
    return txKey.slice(0, 7) === todayKey.slice(0, 7);
  }

  const year = Number(todayKey.slice(0, 4));
  const month = Number(todayKey.slice(5, 7));
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevPrefix = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  return txKey.slice(0, 7) === prevPrefix;
}

export function getCategoryVisual(
  category: string,
  type: string
): {
  id: string;
  emoji: string;
  label: string;
  color: string;
} {
  if (type === "transfer") {
    return {
      id: POKO_TRANSFER_CATEGORY.id,
      emoji: POKO_TRANSFER_CATEGORY.emoji,
      label: POKO_TRANSFER_CATEGORY.label,
      color: POKO_TRANSFER_CATEGORY.color,
    };
  }

  const normalized = category.trim().toLowerCase();
  const pool = type === "income" ? POKO_INCOME_CATEGORIES : POKO_EXPENSE_CATEGORIES;
  const matched = pool.find(
    (item) => item.id.toLowerCase() === normalized || item.label.toLowerCase() === normalized
  );

  if (matched) {
    return {
      id: matched.id,
      emoji: matched.emoji,
      label: matched.label,
      color: matched.color,
    };
  }

  return {
    id: normalized || "lainnya",
    emoji: type === "income" ? "🪙" : "📦",
    label: category.trim() || "Lainnya",
    color: type === "income" ? "#C8FF3D" : "#E2E8F0",
  };
}

export function matchesCategoryFilter(
  txCategory: string,
  txType: string,
  selectedCategory: string
): boolean {
  if (selectedCategory === "all") {
    return true;
  }

  const normalizedFilter = selectedCategory.trim().toLowerCase();
  const rawTxCat = txCategory.trim().toLowerCase();
  const visual = getCategoryVisual(txCategory, txType);

  if (
    rawTxCat === normalizedFilter ||
    visual.label.toLowerCase() === normalizedFilter ||
    visual.id.toLowerCase() === normalizedFilter
  ) {
    return true;
  }

  const option = TRANSACTION_FILTER_CATEGORIES.find(
    (item) => item.value.toLowerCase() === normalizedFilter
  );

  if (!option) {
    return false;
  }

  return (
    option.matchKeys.includes(rawTxCat) ||
    option.matchKeys.includes(visual.id.toLowerCase()) ||
    option.matchKeys.includes(visual.label.toLowerCase())
  );
}

export function getTypeBadgeMeta(type: string): {
  label: string;
  badgeClass: string;
  amountClass: string;
  prefix: string;
  Icon: typeof ArrowDownLeft;
} {
  if (type === "income") {
    return {
      label: "Pemasukan",
      badgeClass: "bg-lime text-ink",
      amountClass: "text-income",
      prefix: "+",
      Icon: ArrowDownLeft,
    };
  }

  if (type === "transfer") {
    return {
      label: "Transfer",
      badgeClass: "bg-cyan text-ink",
      amountClass: "text-transfer",
      prefix: "",
      Icon: ArrowLeftRight,
    };
  }

  return {
    label: "Pengeluaran",
    badgeClass: "bg-coral/45 text-ink",
    amountClass: "text-expense",
    prefix: "-",
    Icon: ArrowUpRight,
  };
}

export function getTransactionDisplayTitle(tx: TransactionWithWallets): string {
  const visual = getCategoryVisual(tx.category, tx.type);
  return tx.note?.trim() || tx.merchant?.trim() || visual.label || "Transaksi";
}

export function getTransactionWalletRoute(tx: TransactionWithWallets): string {
  if (tx.type === "transfer") {
    return `${tx.wallet?.name ?? "Dompet Asal"} → ${tx.destination_wallet?.name ?? "Dompet Tujuan"}`;
  }
  return tx.wallet?.name ?? "Dompet";
}
