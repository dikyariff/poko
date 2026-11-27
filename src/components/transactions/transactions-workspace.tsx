"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Hash,
  Plus,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { TransactionWithWallets } from "@/actions/transactions";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { TransactionList } from "@/components/transactions/transaction-list";
import {
  getCategoryVisual,
  matchesCategoryFilter,
  matchesJakartaPeriod,
  TRANSACTION_FILTER_CATEGORIES,
  TRANSACTION_PERIOD_OPTIONS,
  type TransactionPeriodFilter,
  type TransactionTypeFilter,
} from "@/components/transactions/transaction-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Wallet } from "@/types/database";

export interface TransactionsWorkspaceProps {
  initialTransactions: TransactionWithWallets[];
  wallets: Wallet[];
  todayKey: string;
  warningMessage?: string | null;
}

const TYPE_FILTER_PILLS: readonly {
  value: TransactionTypeFilter;
  label: string;
}[] = [
  { value: "all", label: "Semua" },
  { value: "expense", label: "Pengeluaran" },
  { value: "income", label: "Pemasukan" },
  { value: "transfer", label: "Transfer" },
] as const;

function NewTransactionQuerySync({ onTriggerOpen }: { onTriggerOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shouldOpenNew = searchParams.get("new") === "1";

  React.useEffect(() => {
    if (!shouldOpenNew) {
      return;
    }

    onTriggerOpen();

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("new");
    const nextQuery = nextParams.toString();
    const cleanUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(cleanUrl, { scroll: false });
  }, [shouldOpenNew, searchParams, pathname, router, onTriggerOpen]);

  return null;
}

export function TransactionsWorkspace({
  initialTransactions,
  wallets,
  todayKey,
  warningMessage,
}: TransactionsWorkspaceProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(() => new Set());

  // Multi-filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TransactionTypeFilter>("all");
  const [walletFilter, setWalletFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [periodFilter, setPeriodFilter] = React.useState<TransactionPeriodFilter>("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const handleOpenModalFromQuery = React.useCallback(() => {
    setModalOpen(true);
  }, []);

  // Sinkronkan transaksi aktif dengan penghapusan optimistik lokal sebelum router.refresh() selesai
  const liveTransactions = React.useMemo(() => {
    if (deletedIds.size === 0) {
      return initialTransactions;
    }
    return initialTransactions.filter((tx) => !deletedIds.has(tx.id));
  }, [initialTransactions, deletedIds]);

  // Opsi dompet untuk filter (dompet aktif + dompet arsip yang mungkin muncul di riwayat)
  const walletFilterOptions = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const wallet of wallets) {
      map.set(wallet.id, { id: wallet.id, name: wallet.name });
    }
    for (const tx of liveTransactions) {
      if (tx.wallet && !map.has(tx.wallet.id)) {
        map.set(tx.wallet.id, { id: tx.wallet.id, name: tx.wallet.name });
      }
      if (tx.destination_wallet && !map.has(tx.destination_wallet.id)) {
        map.set(tx.destination_wallet.id, {
          id: tx.destination_wallet.id,
          name: tx.destination_wallet.name,
        });
      }
    }
    return Array.from(map.values());
  }, [wallets, liveTransactions]);

  const filteredTransactions = React.useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return liveTransactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }

      if (
        walletFilter !== "all" &&
        tx.wallet_id !== walletFilter &&
        tx.destination_wallet_id !== walletFilter
      ) {
        return false;
      }

      if (!matchesCategoryFilter(tx.category, tx.type, categoryFilter)) {
        return false;
      }

      if (!matchesJakartaPeriod(tx.occurred_at, periodFilter, todayKey)) {
        return false;
      }

      if (normalizedSearch.length > 0) {
        const categoryVisual = getCategoryVisual(tx.category, tx.type);
        const haystack = [
          tx.note ?? "",
          tx.merchant ?? "",
          tx.category ?? "",
          categoryVisual.label,
          tx.wallet?.name ?? "",
          tx.destination_wallet?.name ?? "",
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [
    liveTransactions,
    searchQuery,
    typeFilter,
    walletFilter,
    categoryFilter,
    periodFilter,
    todayKey,
  ]);

  const kpiSummary = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    let transferCount = 0;

    for (const tx of filteredTransactions) {
      const amount = Number(tx.amount ?? 0);
      if (tx.type === "income") {
        income += amount;
      } else if (tx.type === "expense") {
        expense += amount;
      } else if (tx.type === "transfer") {
        transferCount += 1;
      }
    }

    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
      transferCount,
    };
  }, [filteredTransactions]);

  const advancedFilterCount =
    (walletFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (periodFilter !== "all" ? 1 : 0);

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) + (typeFilter !== "all" ? 1 : 0) + advancedFilterCount;

  const hasActiveFilters = activeFilterCount > 0;

  function handleResetFilters() {
    setSearchQuery("");
    setTypeFilter("all");
    setWalletFilter("all");
    setCategoryFilter("all");
    setPeriodFilter("all");
  }

  function handleTransactionDeleted(deletedId: string) {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(deletedId);
      return next;
    });
  }

  const expenseCategories = TRANSACTION_FILTER_CATEGORIES.filter((c) => c.group === "expense");
  const incomeCategories = TRANSACTION_FILTER_CATEGORIES.filter((c) => c.group === "income");
  const transferCategories = TRANSACTION_FILTER_CATEGORIES.filter((c) => c.group === "transfer");

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 sm:gap-6">
      <React.Suspense fallback={null}>
        <NewTransactionQuerySync onTriggerOpen={handleOpenModalFromQuery} />
      </React.Suspense>

      {warningMessage ? (
        <div
          role="status"
          className="border-ink bg-peach/50 shadow-brutal-sm flex items-start gap-3 rounded-2xl border-2 px-4 py-3 text-xs font-bold sm:text-sm"
        >
          <AlertTriangle className="text-ink mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="text-ink leading-relaxed">{warningMessage}</p>
        </div>
      ) : null}

      {/* Header Aksi Halaman Transaksi (memastikan tombol + Catat Transaksi mudah dijangkau di Mobile & Desktop) */}
      <section
        aria-labelledby="transactions-workspace-heading"
        className="border-ink bg-card shadow-brutal flex flex-wrap items-center justify-between gap-3 rounded-[22px] border-[2.5px] p-4 sm:p-5"
      >
        <div className="min-w-0 space-y-0.5">
          <h2
            id="transactions-workspace-heading"
            className="font-display text-ink text-lg leading-snug font-bold tracking-tight sm:text-xl"
          >
            Buku Catatan Transaksi
          </h2>
          <p className="text-ink-muted text-xs font-semibold sm:text-sm">
            Cari merchant, filter dompet atau periode WIB, dan catat transaksi atomik tanpa ribet.
          </p>
        </div>

        <Button
          type="button"
          variant="default"
          onClick={() => setModalOpen(true)}
          data-testid="btn-open-tx-modal"
          className="min-h-11 w-full sm:w-auto"
        >
          <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
          Catat Transaksi
        </Button>
      </section>

      {/* Ringkasan Hasil Filter (4 KPI Cards Dinamis dengan <PrivateAmount />) */}
      <section
        aria-label="Ringkasan hasil filter transaksi"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {/* KPI 1: Pemasukan */}
        <article
          data-slot="kpi-income"
          className="border-ink bg-card shadow-brutal-sm flex min-w-0 flex-col justify-between gap-2.5 rounded-[18px] border-[2.5px] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink-muted text-[11px] font-extrabold tracking-wide uppercase">
              Pemasukan
            </span>
            <span className="border-ink bg-lime flex size-7 shrink-0 items-center justify-center rounded-lg border-2 shadow-[1.5px_1.5px_0px_#111111]">
              <ArrowDownLeft className="text-ink size-3.5 stroke-[2.5]" aria-hidden="true" />
            </span>
          </div>
          <p className="text-income truncate text-base font-extrabold sm:text-lg">
            <PrivateAmount
              amount={kpiSummary.income}
              prefix={kpiSummary.income > 0 ? "+" : undefined}
            />
          </p>
        </article>

        {/* KPI 2: Pengeluaran */}
        <article
          data-slot="kpi-expense"
          className="border-ink bg-card shadow-brutal-sm flex min-w-0 flex-col justify-between gap-2.5 rounded-[18px] border-[2.5px] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink-muted text-[11px] font-extrabold tracking-wide uppercase">
              Pengeluaran
            </span>
            <span className="border-ink bg-coral/70 flex size-7 shrink-0 items-center justify-center rounded-lg border-2 shadow-[1.5px_1.5px_0px_#111111]">
              <ArrowUpRight className="text-ink size-3.5 stroke-[2.5]" aria-hidden="true" />
            </span>
          </div>
          <p className="text-expense truncate text-base font-extrabold sm:text-lg">
            <PrivateAmount
              amount={kpiSummary.expense}
              prefix={kpiSummary.expense > 0 ? "-" : undefined}
            />
          </p>
        </article>

        {/* KPI 3: Arus Kas Bersih */}
        <article
          data-slot="kpi-net"
          className="border-ink bg-card shadow-brutal-sm flex min-w-0 flex-col justify-between gap-2.5 rounded-[18px] border-[2.5px] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink-muted text-[11px] font-extrabold tracking-wide uppercase">
              Arus Kas Bersih
            </span>
            <span className="border-ink bg-yellow flex size-7 shrink-0 items-center justify-center rounded-lg border-2 shadow-[1.5px_1.5px_0px_#111111]">
              <Scale className="text-ink size-3.5 stroke-[2.5]" aria-hidden="true" />
            </span>
          </div>
          <p
            className={cn(
              "truncate text-base font-extrabold sm:text-lg",
              kpiSummary.net > 0 ? "text-income" : kpiSummary.net < 0 ? "text-expense" : "text-ink"
            )}
          >
            <PrivateAmount amount={kpiSummary.net} showSign />
          </p>
        </article>

        {/* KPI 4: Total Transaksi */}
        <article
          data-slot="kpi-count"
          className="border-ink bg-card shadow-brutal-sm flex min-w-0 flex-col justify-between gap-2.5 rounded-[18px] border-[2.5px] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink-muted text-[11px] font-extrabold tracking-wide uppercase">
              Total Transaksi
            </span>
            <span className="border-ink bg-lavender flex size-7 shrink-0 items-center justify-center rounded-lg border-2 shadow-[1.5px_1.5px_0px_#111111]">
              <Hash className="text-ink size-3.5 stroke-[2.5]" aria-hidden="true" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="font-mono text-ink text-base font-extrabold tabular-nums sm:text-lg">
              {kpiSummary.count}
            </p>
            <span className="text-ink-muted truncate text-xs font-semibold">
              {hasActiveFilters ? `dari ${liveTransactions.length} catatan` : "catatan"}
            </span>
          </div>
        </article>
      </section>

      {/* Toolbar Pencarian & Multi-Filter */}
      <section
        aria-label="Pencarian dan filter transaksi"
        data-slot="transactions-filter-bar"
        className="border-ink bg-card shadow-brutal flex min-w-0 flex-col gap-3 rounded-[22px] border-[2.5px] p-3.5 sm:p-5 md:gap-4"
      >
        {/* Row 1: Search Input (+ Mobile Filter Toggle) + Dompet + Kategori + Periode */}
        <div className="grid gap-2.5 md:grid-cols-12 md:gap-3">
          {/* Search Input + Mobile Filter Button */}
          <div className="flex min-w-0 items-center gap-2 md:col-span-5">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="tx-search-input" className="sr-only">
                Cari transaksi berdasarkan catatan, merchant, kategori, atau nama dompet
              </label>
              <Search
                className="text-ink-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="tx-search-input"
                type="search"
                autoComplete="off"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari catatan, merchant, dompet..."
                data-testid="tx-search-input"
                className="pr-9 pl-10"
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="Bersihkan kata kunci pencarian"
                  onClick={() => setSearchQuery("")}
                  className="text-ink-muted hover:text-ink absolute top-1/2 right-2.5 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <Button
              type="button"
              variant="outline"
              aria-expanded={mobileFiltersOpen}
              aria-controls="tx-advanced-filters"
              data-testid="tx-mobile-filter-toggle"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className={cn(
                "min-h-11 shrink-0 gap-1.5 px-3 text-xs font-extrabold md:hidden",
                (mobileFiltersOpen || advancedFilterCount > 0) && "bg-yellow hover:bg-yellow-hover"
              )}
            >
              <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
              <span>Filter</span>
              {advancedFilterCount > 0 ? (
                <span className="bg-ink inline-flex size-5 items-center justify-center rounded-full font-mono text-[10px] font-extrabold text-white">
                  {advancedFilterCount}
                </span>
              ) : null}
            </Button>
          </div>

          {/* Filter Lanjutan: Collapsible di Mobile (< 768px), selalu tampil di Desktop (>= 768px) */}
          <div
            id="tx-advanced-filters"
            className={cn(
              "grid-cols-2 gap-2 md:col-span-7 md:grid md:grid-cols-7 md:gap-3",
              mobileFiltersOpen ? "grid" : "hidden"
            )}
          >
            {/* Filter Dompet */}
            <div className="col-span-1 md:col-span-2">
              <Select value={walletFilter} onValueChange={setWalletFilter}>
                <SelectTrigger
                  aria-label="Filter dompet"
                  data-testid="tx-wallet-filter"
                  size="sm"
                  className="w-full md:min-h-11 md:px-3.5 md:text-sm"
                >
                  <SelectValue placeholder="Semua Dompet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Dompet</SelectItem>
                  {walletFilterOptions.length > 0 ? <SelectSeparator /> : null}
                  {walletFilterOptions.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Periode (Asia/Jakarta) */}
            <div className="col-span-1 md:order-3 md:col-span-2">
              <Select
                value={periodFilter}
                onValueChange={(value) => setPeriodFilter(value as TransactionPeriodFilter)}
              >
                <SelectTrigger
                  aria-label="Filter periode waktu WIB"
                  data-testid="tx-period-filter"
                  size="sm"
                  className="w-full md:min-h-11 md:px-3.5 md:text-sm"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Calendar className="text-ink-muted size-3.5 shrink-0" aria-hidden="true" />
                    <SelectValue placeholder="Semua Waktu" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Kategori */}
            <div className="col-span-2 md:order-2 md:col-span-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger
                  aria-label="Filter kategori"
                  data-testid="tx-category-filter"
                  size="sm"
                  className="w-full md:min-h-11 md:px-3.5 md:text-sm"
                >
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Pengeluaran</SelectLabel>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-1.5">
                          <span aria-hidden="true">{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Pemasukan</SelectLabel>
                    {incomeCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-1.5">
                          <span aria-hidden="true">{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {transferCategories.length > 0 ? (
                    <>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Lainnya</SelectLabel>
                        {transferCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-1.5">
                              <span aria-hidden="true">{cat.emoji}</span>
                              <span>{cat.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Row 2: Filter Tipe Pills + Indikator Jumlah & Reset */}
        <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
          <div
            role="group"
            aria-label="Filter tipe transaksi"
            className="-mx-0.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-0.5 pb-0.5 md:mx-0 md:flex-wrap md:gap-2 md:overflow-visible md:px-0 md:pb-0"
          >
            {TYPE_FILTER_PILLS.map((pill) => {
              const active = typeFilter === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  aria-pressed={active}
                  data-testid={`tx-filter-type-${pill.value}`}
                  onClick={() => setTypeFilter(pill.value)}
                  className={cn(
                    "border-ink min-h-8 shrink-0 cursor-pointer rounded-full border-2 px-3 py-1 text-[11px] font-extrabold shadow-[2px_2px_0px_#111111] transition-[transform,background-color,color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 md:min-h-9 md:px-3.5 md:py-1.5 md:text-xs",
                    active ? "bg-ink text-white" : "bg-card text-ink hover:bg-subtle"
                  )}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 md:justify-end">
            <span
              data-testid="tx-result-count"
              className="text-ink-muted md:border-ink md:bg-subtle md:text-ink inline-flex items-center gap-1.5 text-xs font-bold md:min-h-9 md:rounded-full md:border-2 md:px-3 md:py-1 md:font-extrabold"
            >
              <SlidersHorizontal
                className="hidden size-3.5 shrink-0 md:inline"
                aria-hidden="true"
              />
              <span>
                {hasActiveFilters
                  ? `${filteredTransactions.length} dari ${liveTransactions.length} transaksi`
                  : `${liveTransactions.length} transaksi ditampilkan`}
              </span>
            </span>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                data-testid="tx-reset-filter-btn"
                className="bg-yellow/60 hover:bg-yellow min-h-8 rounded-full px-2.5 text-[11px] font-extrabold md:min-h-9 md:px-3 md:text-xs"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Reset ({activeFilterCount})
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Daftar Transaksi + AlertDialog Hapus Atomik */}
      <TransactionList
        transactions={filteredTransactions}
        totalCount={liveTransactions.length}
        todayKey={todayKey}
        onOpenAddModal={() => setModalOpen(true)}
        onResetFilters={handleResetFilters}
        onDeleted={handleTransactionDeleted}
      />

      {/* Modal Catat Transaksi (Dialog Desktop / Vaul Drawer Mobile) */}
      <TransactionFormModal open={modalOpen} onOpenChange={setModalOpen} wallets={wallets} />
    </div>
  );
}
