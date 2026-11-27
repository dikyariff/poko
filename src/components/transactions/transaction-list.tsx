"use client";

import * as React from "react";
import { Loader2, Plus, ReceiptText, RotateCcw, SearchX, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteTransaction, type TransactionWithWallets } from "@/actions/transactions";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import {
  formatJakartaDateGroupHeader,
  formatWibTime,
  getCategoryVisual,
  getJakartaDateKey,
  getTransactionDisplayTitle,
  getTransactionWalletRoute,
  getTypeBadgeMeta,
  shiftDateKey,
} from "@/components/transactions/transaction-utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TransactionListProps {
  transactions: TransactionWithWallets[];
  totalCount: number;
  todayKey: string;
  onOpenAddModal: () => void;
  onResetFilters: () => void;
  onDeleted?: (transactionId: string) => void;
}

interface TransactionDateGroup {
  dateKey: string;
  primaryLabel: string;
  secondaryLabel: string | null;
  items: TransactionWithWallets[];
  dailyNet: number;
}

export function TransactionList({
  transactions,
  totalCount,
  todayKey,
  onOpenAddModal,
  onResetFilters,
  onDeleted,
}: TransactionListProps) {
  const router = useRouter();
  const [pendingDeleteTx, setPendingDeleteTx] = React.useState<TransactionWithWallets | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const groupedTransactions = React.useMemo<TransactionDateGroup[]>(() => {
    const yesterdayKey = shiftDateKey(todayKey, -1);
    const groupMap = new Map<string, TransactionWithWallets[]>();

    for (const tx of transactions) {
      const dateKey = getJakartaDateKey(tx.occurred_at);
      const existing = groupMap.get(dateKey);
      if (existing) {
        existing.push(tx);
      } else {
        groupMap.set(dateKey, [tx]);
      }
    }

    return Array.from(groupMap.entries()).map(([dateKey, items]) => {
      const header = formatJakartaDateGroupHeader(dateKey, todayKey, yesterdayKey);
      const dailyNet = items.reduce((acc, tx) => {
        const amount = Number(tx.amount ?? 0);
        if (tx.type === "income") return acc + amount;
        if (tx.type === "expense") return acc - amount;
        return acc;
      }, 0);

      return {
        dateKey,
        primaryLabel: header.primary,
        secondaryLabel: header.secondary,
        items,
        dailyNet,
      };
    });
  }, [transactions, todayKey]);

  async function handleConfirmDelete() {
    if (!pendingDeleteTx || isDeleting) {
      return;
    }

    const target = pendingDeleteTx;
    setIsDeleting(true);

    try {
      const result = await deleteTransaction({ id: target.id });

      if (!result.ok) {
        toast.error("Gagal menghapus transaksi", {
          id: "poko-tx-delete-error",
          description: result.error,
        });
        return;
      }

      toast.success("Transaksi berhasil dihapus", {
        id: "poko-tx-delete-success",
        description: `Saldo ${getTransactionWalletRoute(target)} otomatis di-rollback secara atomik.`,
      });

      setPendingDeleteTx(null);
      onDeleted?.(target.id);
      router.refresh();
    } catch {
      toast.error("Gagal menghapus transaksi", {
        id: "poko-tx-delete-error",
        description: "Terjadi kendala koneksi ke server. Silakan coba lagi.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  // Empty State 1: Belum ada transaksi sama sekali
  if (totalCount === 0) {
    return (
      <section
        aria-label="Daftar transaksi kosong"
        data-testid="transactions-empty-initial"
        className="border-ink bg-card shadow-brutal flex flex-col items-center justify-center gap-4 rounded-[22px] border-[2.5px] px-6 py-12 text-center"
      >
        <span className="border-ink bg-yellow shadow-brutal-sm inline-flex size-14 items-center justify-center rounded-2xl border-[2.5px]">
          <ReceiptText className="text-ink size-7" aria-hidden="true" />
        </span>
        <div className="max-w-md space-y-1.5">
          <h2 className="font-display text-ink text-xl font-bold tracking-tight">
            Belum ada transaksi tercatat
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed font-medium">
            Mulai catat pemasukan, pengeluaran harian, atau transfer ke Tabungan Utama agar arus kas
            dan saldo dompetmu selalu rapi &amp; terpantau real-time.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          onClick={onOpenAddModal}
          data-testid="btn-empty-add-tx"
          className="min-h-11 px-5"
        >
          <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
          Catat Transaksi Pertama
        </Button>
      </section>
    );
  }

  // Empty State 2: Ada transaksi, namun tidak cocok dengan filter/pencarian
  if (transactions.length === 0) {
    return (
      <section
        aria-label="Hasil filter transaksi kosong"
        data-testid="transactions-empty-filtered"
        className="border-ink bg-card shadow-brutal flex flex-col items-center justify-center gap-4 rounded-[22px] border-[2.5px] px-6 py-12 text-center"
      >
        <span className="border-ink bg-cyan shadow-brutal-sm inline-flex size-14 items-center justify-center rounded-2xl border-[2.5px]">
          <SearchX className="text-ink size-7" aria-hidden="true" />
        </span>
        <div className="max-w-md space-y-1.5">
          <h2 className="font-display text-ink text-xl font-bold tracking-tight">
            Tidak ada transaksi yang cocok
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed font-medium">
            Coba ubah kata kunci pencarian atau longgarkan filter tipe, dompet, kategori, maupun
            periode waktu yang sedang aktif.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onResetFilters}
          data-testid="btn-empty-reset-filter"
          className="min-h-11 px-5"
        >
          <RotateCcw className="size-4 stroke-[2.5]" aria-hidden="true" />
          Reset Filter
        </Button>
      </section>
    );
  }

  return (
    <>
      <section
        aria-label="Daftar transaksi dikelompokkan per tanggal"
        className="flex flex-col gap-4"
      >
        {groupedTransactions.map((group) => (
          <div
            key={group.dateKey}
            data-slot="transaction-date-group"
            className="border-ink bg-card shadow-brutal overflow-hidden rounded-[22px] border-[2.5px]"
          >
            {/* Header Tanggal Grup */}
            <div className="border-ink bg-subtle flex flex-wrap items-center justify-between gap-2 border-b-[2.5px] px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="font-display text-ink text-sm leading-tight font-bold sm:text-base">
                  {group.primaryLabel}
                </h3>
                {group.secondaryLabel ? (
                  <span className="border-ink bg-card text-ink-muted rounded-full border-[1.5px] px-2 py-0.5 font-mono text-[11px] font-bold">
                    {group.secondaryLabel}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-ink-muted">{group.items.length} transaksi</span>
                {group.dailyNet !== 0 ? (
                  <span
                    className={cn(
                      "border-ink bg-card rounded-full border-[1.5px] px-2.5 py-0.5 font-extrabold",
                      group.dailyNet > 0 ? "text-income" : "text-expense"
                    )}
                  >
                    <PrivateAmount amount={group.dailyNet} showSign />
                  </span>
                ) : null}
              </div>
            </div>

            {/* Daftar Baris Transaksi */}
            <ul className="divide-ink/12 flex flex-col divide-y-2 px-2 py-1 sm:px-3">
              {group.items.map((tx) => {
                const categoryVisual = getCategoryVisual(tx.category, tx.type);
                const typeMeta = getTypeBadgeMeta(tx.type);
                const TypeIcon = typeMeta.Icon;
                const title = getTransactionDisplayTitle(tx);
                const walletRoute = getTransactionWalletRoute(tx);

                return (
                  <li
                    key={tx.id}
                    data-slot="transaction-row"
                    className="hover:bg-subtle/80 flex min-w-0 items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors duration-150 sm:px-2.5"
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
                          <p className="text-ink truncate text-sm leading-tight font-extrabold sm:text-[15px]">
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

                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-sm font-extrabold sm:text-base",
                            typeMeta.amountClass
                          )}
                        >
                          <PrivateAmount amount={Number(tx.amount ?? 0)} prefix={typeMeta.prefix} />
                        </p>
                        <p className="text-ink-soft mt-0.5 font-mono text-[11px] font-semibold">
                          {formatWibTime(tx.occurred_at)}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        data-testid={`tx-delete-btn-${tx.id}`}
                        aria-label={`Hapus transaksi ${title}`}
                        onClick={() => setPendingDeleteTx(tx)}
                        className="bg-subtle hover:bg-coral hover:text-ink size-9 shrink-0"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {/* AlertDialog Konfirmasi Hapus Atomik */}
      <AlertDialog
        open={pendingDeleteTx !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isDeleting) {
            setPendingDeleteTx(null);
          }
        }}
      >
        <AlertDialogContent data-testid="delete-tx-alert-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi akan dihapus permanen dan saldo dompet terkait akan otomatis di-rollback
              secara atomik ke kondisi sebelumnya.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pendingDeleteTx ? (
            <div className="border-ink bg-subtle flex items-center justify-between gap-3 rounded-2xl border-2 p-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  style={{
                    backgroundColor: getCategoryVisual(
                      pendingDeleteTx.category,
                      pendingDeleteTx.type
                    ).color,
                  }}
                  className="border-ink flex size-10 shrink-0 items-center justify-center rounded-xl border-2 text-base shadow-[2px_2px_0px_#111111]"
                  aria-hidden="true"
                >
                  {getCategoryVisual(pendingDeleteTx.category, pendingDeleteTx.type).emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-extrabold">
                    {getTransactionDisplayTitle(pendingDeleteTx)}
                  </p>
                  <p className="text-ink-muted truncate text-xs font-semibold">
                    {getTransactionWalletRoute(pendingDeleteTx)} ·{" "}
                    {formatWibTime(pendingDeleteTx.occurred_at)}
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm font-extrabold",
                  getTypeBadgeMeta(pendingDeleteTx.type).amountClass
                )}
              >
                <PrivateAmount
                  amount={Number(pendingDeleteTx.amount ?? 0)}
                  prefix={getTypeBadgeMeta(pendingDeleteTx.type).prefix}
                />
              </p>
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              data-testid="confirm-delete-tx-btn"
              onClick={handleConfirmDelete}
              className="min-h-11"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span>Ya, Hapus &amp; Rollback</span>
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
