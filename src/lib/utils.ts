import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatIDR(amount: number): string {
  return idrFormatter.format(amount);
}

/**
 * Memformat angka/string digit menjadi pemisah ribuan titik ala Indonesia:
 * 6500000 -> "6.500.000", "0" -> "0", "" -> ""
 */
export function formatNominalInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const digits = String(value).replace(/[^\d]/g, "").slice(0, 15);
  if (digits === "") {
    return "";
  }

  const normalized = digits.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Mengubah string nominal berformat titik ("6.500.000") kembali ke integer aman (6500000).
 * Mengembalikan null bila tidak ada digit sama sekali.
 */
export function parseNominalInput(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : null;
  }

  if (!value) {
    return null;
  }

  const digits = value.replace(/[^\d]/g, "").slice(0, 15);
  if (digits === "") {
    return null;
  }

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
