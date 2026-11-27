"use client";

import * as React from "react";

import { cn, formatIDR } from "@/lib/utils";

export const PRIVACY_STORAGE_KEY = "poko_privacy_mode_v1";
export const PRIVACY_MASK_TEXT = "Rp. *****";

export interface FormatMoneyOptions {
  /** Override prefix when visible (e.g. "+" or "-"). Ignored when masked. */
  prefix?: string;
  /** Automatically include "+" for positive numbers when visible. */
  showSign?: boolean;
  /** Force unmasked IDR output even when privacy mode is enabled. */
  raw?: boolean;
}

export interface PrivacyContextValue {
  isPrivate: boolean;
  togglePrivacy: () => void;
  setPrivacy: (next: boolean) => void;
  formatMoney: (amount: number, options?: FormatMoneyOptions) => string;
}

let memoryPrivacyFallback = false;
const privacyListeners = new Set<() => void>();

function notifyPrivacyListeners(): void {
  privacyListeners.forEach((listener) => listener());
}

function readStoredPrivacy(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (raw === null) {
      return memoryPrivacyFallback;
    }
    const parsed = raw === "true";
    memoryPrivacyFallback = parsed;
    return parsed;
  } catch {
    return memoryPrivacyFallback;
  }
}

function writeStoredPrivacy(next: boolean): void {
  memoryPrivacyFallback = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PRIVACY_STORAGE_KEY, String(next));
    } catch {
      // Ignore storage quota or private-mode restrictions; memory fallback stays in sync.
    }
  }

  notifyPrivacyListeners();
}

function subscribePrivacyStore(onStoreChange: () => void): () => void {
  privacyListeners.add(onStoreChange);

  if (typeof window === "undefined") {
    return () => {
      privacyListeners.delete(onStoreChange);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PRIVACY_STORAGE_KEY) {
      memoryPrivacyFallback = event.newValue === "true";
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    privacyListeners.delete(onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function getPrivacyServerSnapshot(): boolean {
  return false;
}

function formatVisibleIDR(amount: number, options?: FormatMoneyOptions): string {
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  const formattedAbs = formatIDR(Math.abs(safeAmount)).replace(/\u00A0/g, " ");

  if (options?.prefix !== undefined) {
    return `${options.prefix}${formattedAbs}`;
  }

  if (safeAmount < 0) {
    return `-${formattedAbs}`;
  }

  if (options?.showSign && safeAmount > 0) {
    return `+${formattedAbs}`;
  }

  return formattedAbs;
}

const PrivacyContext = React.createContext<PrivacyContextValue | null>(null);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const isPrivate = React.useSyncExternalStore(
    subscribePrivacyStore,
    readStoredPrivacy,
    getPrivacyServerSnapshot
  );

  const setPrivacy = React.useCallback((next: boolean) => {
    writeStoredPrivacy(next);
  }, []);

  const togglePrivacy = React.useCallback(() => {
    writeStoredPrivacy(!readStoredPrivacy());
  }, []);

  const formatMoney = React.useCallback(
    (amount: number, options?: FormatMoneyOptions): string => {
      if (isPrivate && !options?.raw) {
        return PRIVACY_MASK_TEXT;
      }
      return formatVisibleIDR(amount, options);
    },
    [isPrivate]
  );

  const value = React.useMemo<PrivacyContextValue>(
    () => ({
      isPrivate,
      togglePrivacy,
      setPrivacy,
      formatMoney,
    }),
    [isPrivate, togglePrivacy, setPrivacy, formatMoney]
  );

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy(): PrivacyContextValue {
  const ctx = React.useContext(PrivacyContext);
  if (!ctx) {
    throw new Error("usePrivacy harus dipanggil di dalam <PrivacyProvider>.");
  }
  return ctx;
}

export interface PrivateAmountProps extends Omit<React.ComponentProps<"span">, "children"> {
  amount: number;
  prefix?: string;
  showSign?: boolean;
  raw?: boolean;
}

/**
 * Menampilkan nominal IDR dengan JetBrains Mono tabular-nums.
 * Saat Mode Privasi aktif, teks diganti langsung menjadi `Rp. *****` (tanpa CSS blur).
 */
export function PrivateAmount({
  amount,
  prefix,
  showSign,
  raw = false,
  className,
  ...props
}: PrivateAmountProps) {
  const { isPrivate, formatMoney } = usePrivacy();
  const masked = isPrivate && !raw;
  const formatted = formatMoney(amount, { prefix, showSign, raw });

  return (
    <span
      data-slot="private-amount"
      data-private={masked ? "true" : "false"}
      aria-label={masked ? "Nominal disembunyikan" : undefined}
      className={cn(
        "font-mono tracking-tight tabular-nums",
        masked && "tracking-[0.02em] select-none",
        className
      )}
      {...props}
    >
      {formatted}
    </span>
  );
}
