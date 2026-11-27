"use client";

import { ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, ReceiptText } from "lucide-react";
import Link from "next/link";

import type { TransactionWithWallets } from "@/actions/transactions";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  POKO_EXPENSE_CATEGORIES,
  POKO_INCOME_CATEGORIES,
  POKO_TRANSFER_CATEGORY,
} from "@/lib/validations/finance";

export interface RecentTransactionsProps {
  transactions: TransactionWithWallets[];
}

const wibDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatShortWibDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return `${wibDateTimeFormatter.format(parsed).replace(".", ":")} WIB`;
}

function getCategoryVisual(
  category: string,
  type: string
): {
  emoji: string;
  label: string;
  color: string;
} {
  if (type === "transfer") {
    return {
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
    return { emoji: matched.emoji, label: matched.label, color: matched.color };
  }

  return {
    emoji: type === "income" ? "🪙" : "📦",
    label: category.trim() || "Lainnya",
    color: type === "income" ? "#C8FF3D" : "#E2E8F0",
  };
}

function getTypeBadgeMeta(type: string): {
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

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section
      aria-labelledby="recent-transactions-heading"
      data-slot="recent-transactions"
      className="border-ink bg-card shadow-brutal flex h-full min-w-0 flex-col gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h2
            id="recent-transactions-heading"
            className="font-display text-ink text-lg leading-snug font-bold tracking-tight"
          >
            Transaksi Terbaru
          </h2>
          <p className="text-ink-muted text-xs font-semibold sm:text-sm">
            {transactions.length > 0
              ? `Menampilkan ${transactions.length} catatan terakhir dari semua dompet`
              : "Catatan pemasukan, pengeluaran, dan transfer terbarumu"}
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="min-h-9 shrink-0">
          <Link href="/dashboard/transactions">
            Lihat Semua
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="border-ink bg-subtle flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-9 text-center">
          <span className="border-ink bg-cyan shadow-brutal-sm inline-flex size-12 items-center justify-center rounded-2xl border-2">
            <ReceiptText className="text-ink size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-ink text-base font-bold">Belum ada transaksi nih!</p>
            <p className="text-ink-muted max-w-sm text-xs leading-relaxed font-medium">
              Yuk catat jajan, gaji, atau transfer ke Tabungan Utama pertamamu supaya arus kas
              bulanan langsung kelihatan rapi.
            </p>
          </div>
          <Button asChild variant="default" size="sm" className="min-h-10">
            <Link href="/dashboard/transactions">
              Buka Catatan Transaksi
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-ink/12 flex flex-col divide-y-2">
          {transactions.map((tx) => {
            const categoryVisual = getCategoryVisual(tx.category, tx.type);
            const typeMeta = getTypeBadgeMeta(tx.type);
            const TypeIcon = typeMeta.Icon;

            const title =
              tx.note?.trim() || tx.merchant?.trim() || categoryVisual.label || "Transaksi";
            const walletRoute =
              tx.type === "transfer"
                ? `${tx.wallet?.name ?? "Dompet Asal"} → ${tx.destination_wallet?.name ?? "Dompet Tujuan"}`
                : (tx.wallet?.name ?? "Dompet");

            return (
              <li
                key={tx.id}
                className="hover:bg-subtle/80 flex min-w-0 items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors duration-150 first:pt-1 last:pb-1"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    style={{ backgroundColor: categoryVisual.color }}
                    className="border-ink flex size-11 shrink-0 items-center justify-center rounded-xl border-2 text-lg shadow-[2px_2px_0px_#111111]"
                    aria-hidden="true"
                  >
                    {categoryVisual.emoji}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-ink truncate text-sm leading-tight font-extrabold">
                        {title}
                      </p>
                      <span
                        className={cn(
                          "border-ink inline-flex shrink-0 items-center gap-1 rounded-full border-[1.5px] px-2 py-0.5 text-[10px] leading-none font-extrabold",
                          typeMeta.badgeClass
                        )}
                      >
                        <TypeIcon className="size-2.5" aria-hidden="true" />
                        {typeMeta.label}
                      </span>
                    </div>

                    <p className="text-ink-muted truncate text-xs font-semibold">
                      <span>{categoryVisual.label}</span>
                      {tx.merchant?.trim() && tx.note?.trim() ? (
                        <span> · {tx.merchant.trim()}</span>
                      ) : null}
                      <span> · {walletRoute}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className={cn("text-sm font-extrabold sm:text-[15px]", typeMeta.amountClass)}>
                    <PrivateAmount amount={Number(tx.amount ?? 0)} prefix={typeMeta.prefix} />
                  </p>
                  <p className="text-ink-soft mt-0.5 font-mono text-[11px] font-semibold">
                    {formatShortWibDate(tx.occurred_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
