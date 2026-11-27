"use client";

import { ArrowDownLeft, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";

import { PrivacyToggleButton } from "@/components/layout/privacy-toggle-button";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface HeroBalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashflow: number;
  savingsRate: number | null;
  monthlyBudgetLimit: number;
  walletCount: number;
  monthLabel: string;
  dataSource?: "supabase" | "fallback";
}

export function HeroBalanceCard({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  netCashflow,
  savingsRate,
  monthlyBudgetLimit,
  walletCount,
  monthLabel,
  dataSource = "supabase",
}: HeroBalanceCardProps) {
  const usedRatio =
    monthlyBudgetLimit > 0
      ? Math.min(100, Math.round((monthlyExpense / monthlyBudgetLimit) * 100))
      : 0;
  const budgetTone = usedRatio >= 90 ? "danger" : usedRatio >= 75 ? "warning" : "default";
  const budgetLabel =
    usedRatio >= 90
      ? "Hampir habis — Rem dulu"
      : usedRatio >= 75
        ? "Mulai menipis — Tetap fokus"
        : "Masih aman";

  const isPositiveNet = netCashflow >= 0;
  const savingsRateLabel =
    savingsRate !== null ? `Rasio Menabung ${savingsRate}%` : "Belum ada pemasukan";

  return (
    <section
      aria-labelledby="hero-balance-heading"
      data-slot="hero-balance-card"
      className="border-ink bg-yellow shadow-brutal flex h-full min-w-0 flex-col justify-between gap-5 rounded-[22px] border-[2.5px] p-5 sm:p-6"
    >
      {/* Top Row: Total Net Balance + Synchronized Privacy Toggle #1 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="hero-balance-heading"
              className="text-ink flex items-center gap-1.5 text-sm font-extrabold"
            >
              <Wallet className="size-4 shrink-0" aria-hidden="true" />
              Total Saldo Bersih
            </h2>
            <span className="border-ink bg-card inline-flex items-center rounded-full border-2 px-2.5 py-0.5 font-mono text-[11px] font-bold">
              {walletCount} Dompet Aktif
            </span>
            <span className="border-ink bg-subtle inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-[11px] font-bold">
              {monthLabel}
            </span>
            {dataSource === "fallback" ? (
              <span className="border-ink bg-peach inline-flex items-center rounded-full border-2 px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase">
                Mode Aman
              </span>
            ) : null}
          </div>

          <p className="text-ink text-3xl leading-none font-extrabold break-words sm:text-4xl">
            <PrivateAmount amount={totalBalance} />
          </p>
        </div>

        {/* Synchronized Privacy Toggle #1 */}
        <PrivacyToggleButton id="btn-privacy-hero" placement="hero" />
      </div>

      {/* 3-Cell Cashflow Summary Strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="border-ink bg-card min-w-0 rounded-2xl border-[2.5px] p-3 sm:p-3.5">
          <p className="text-ink-muted flex items-center gap-1 text-[11px] font-bold sm:text-xs">
            <ArrowDownLeft className="text-income size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Pemasukan<span className="hidden sm:inline"> Bulan Ini</span>
            </span>
          </p>
          <p className="text-income mt-1.5 truncate text-[13px] font-extrabold tracking-tighter sm:text-lg sm:tracking-tight">
            <PrivateAmount amount={monthlyIncome} prefix="+" />
          </p>
        </div>

        <div className="border-ink bg-card min-w-0 rounded-2xl border-[2.5px] p-3 sm:p-3.5">
          <p className="text-ink-muted flex items-center gap-1 text-[11px] font-bold sm:text-xs">
            <ArrowUpRight className="text-expense size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Pengeluaran<span className="hidden sm:inline"> Bulan Ini</span>
            </span>
          </p>
          <p className="text-expense mt-1.5 truncate text-[13px] font-extrabold tracking-tighter sm:text-lg sm:tracking-tight">
            <PrivateAmount amount={monthlyExpense} prefix="-" />
          </p>
        </div>

        <div className="border-ink bg-card col-span-2 min-w-0 rounded-2xl border-[2.5px] p-3 sm:col-span-1 sm:p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-ink-muted flex min-w-0 items-center gap-1 text-[11px] font-bold sm:text-xs">
              <TrendingUp
                className={cn(
                  "size-3.5 shrink-0",
                  isPositiveNet ? "text-transfer" : "text-expense"
                )}
                aria-hidden="true"
              />
              <span className="truncate">Arus Kas Bersih</span>
            </p>
            <span
              className={cn(
                "border-ink shrink-0 rounded-full border-[1.5px] px-2 py-0.5 font-mono text-[10px] font-extrabold",
                savingsRate === null
                  ? "bg-subtle text-ink-muted"
                  : savingsRate >= 20
                    ? "bg-lime text-ink"
                    : savingsRate >= 0
                      ? "bg-yellow text-ink"
                      : "bg-coral/60 text-ink"
              )}
            >
              {savingsRate !== null ? `${savingsRate}%` : "0%"}
            </span>
          </div>
          <p
            className={cn(
              "mt-1.5 truncate text-base font-extrabold sm:text-lg",
              isPositiveNet ? "text-income" : "text-expense"
            )}
          >
            <PrivateAmount amount={netCashflow} showSign />
          </p>
          <p className="text-ink-soft mt-0.5 truncate text-[11px] font-semibold">
            {savingsRateLabel}
          </p>
        </div>
      </div>

      {/* Monthly Spending Limit Bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold sm:text-sm">
          <span>
            Batas Jajan Bulanan (<PrivateAmount amount={monthlyBudgetLimit} className="font-bold" />
            )
          </span>
          <span className="font-mono tabular-nums">
            {usedRatio}% terpakai — {budgetLabel}
          </span>
        </div>

        <Progress
          value={usedRatio}
          tone={budgetTone}
          aria-label="Persentase penggunaan batas jajan bulanan"
        />
      </div>
    </section>
  );
}

export { HeroBalanceCard as BalanceHeroCard };
