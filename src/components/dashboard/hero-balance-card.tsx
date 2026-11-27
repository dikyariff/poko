"use client";

import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";

import { PrivacyToggleButton } from "@/components/layout/privacy-toggle-button";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import { Progress } from "@/components/ui/progress";

export interface HeroBalanceCardProps {
  totalBalance?: number;
  monthlyIncome?: number;
  monthlyExpense?: number;
  primarySavings?: number;
  monthlyBudgetLimit?: number;
}

export function HeroBalanceCard({
  totalBalance = 5025000,
  monthlyIncome = 7250000,
  monthlyExpense = 2225000,
  primarySavings = 1850000,
  monthlyBudgetLimit = 3500000,
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

  return (
    <section
      aria-labelledby="hero-balance-heading"
      className="border-ink bg-yellow shadow-brutal flex min-w-0 flex-col gap-5 rounded-[22px] border-[2.5px] p-5 sm:p-6"
    >
      {/* Top Row: Total Balance + Privacy Toggle #1 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="hero-balance-heading"
              className="text-ink flex items-center gap-1.5 text-sm font-extrabold"
            >
              <Wallet className="size-4 shrink-0" aria-hidden="true" />
              Total Saldo Bersih
            </h2>
            <span className="border-ink bg-card inline-flex items-center rounded-full border-2 px-2.5 py-0.5 font-mono text-[11px] font-bold">
              Preview · 4 Dompet
            </span>
          </div>

          <p className="text-ink text-3xl leading-none font-extrabold sm:text-4xl">
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
          <p className="text-income mt-1.5 text-[13px] font-extrabold tracking-tighter sm:text-lg sm:tracking-tight">
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
          <p className="text-expense mt-1.5 text-[13px] font-extrabold tracking-tighter sm:text-lg sm:tracking-tight">
            <PrivateAmount amount={monthlyExpense} prefix="-" />
          </p>
        </div>

        <div className="border-ink bg-card col-span-2 min-w-0 rounded-2xl border-[2.5px] p-3 sm:col-span-1 sm:p-3.5">
          <p className="text-ink-muted flex items-center gap-1 text-[11px] font-bold sm:text-xs">
            <PiggyBank className="text-transfer size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Tabungan Utama</span>
          </p>
          <p className="text-transfer mt-1.5 text-base font-extrabold sm:text-lg">
            <PrivateAmount amount={primarySavings} />
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
