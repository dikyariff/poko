import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

import { HeroBalanceCard } from "@/components/dashboard/hero-balance-card";
import { HomeDreamPreview } from "@/components/dashboard/home-dream-preview";
import { InsightPokoAI } from "@/components/dashboard/insight-poko-ai";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletStrip } from "@/components/dashboard/wallet-strip";
import { Skeleton } from "@/components/ui/skeleton";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { getHomeDashboardData } from "@/lib/home-dashboard-data";

export const metadata: Metadata = {
  title: "Beranda Keuangan — Poko",
  description:
    "Ringkasan total saldo bersih, arus kas bulanan, dompet aktif, transaksi terbaru, Impian & Tabungan, serta Insight Poko AI.",
};

function DashboardHomeSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5 sm:gap-6">
      <div className="grid gap-5 xl:grid-cols-12">
        <Skeleton className="h-64 w-full rounded-[22px] xl:col-span-8" />
        <Skeleton className="h-64 w-full rounded-[22px] xl:col-span-4" />
      </div>
      <Skeleton className="h-44 w-full rounded-[22px]" />
      <div className="grid gap-5 lg:grid-cols-12">
        <Skeleton className="h-72 w-full rounded-[22px] lg:col-span-7" />
        <Skeleton className="h-72 w-full rounded-[22px] lg:col-span-5" />
      </div>
    </div>
  );
}

async function DashboardHomeContent() {
  const { userId } = await requireDashboardSession("/dashboard");
  const dashboardData = await getHomeDashboardData(userId);

  return (
    <div className="flex w-full flex-col gap-5 sm:gap-6">
      {/* Banner peringatan lembut bila fallback mode aktif */}
      {dashboardData.warningMessage ? (
        <div
          role="status"
          className="border-ink bg-peach/50 shadow-brutal-sm flex items-start gap-3 rounded-2xl border-2 px-4 py-3 text-xs font-bold sm:text-sm"
        >
          <AlertTriangle className="text-ink mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="text-ink leading-relaxed">{dashboardData.warningMessage}</p>
        </div>
      ) : null}

      {/* Row 1: Hero Balance Card (8 col) + Insight Poko AI (4 col) */}
      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <HeroBalanceCard
            totalBalance={dashboardData.metrics.totalBalance}
            monthlyIncome={dashboardData.metrics.monthlyIncome}
            monthlyExpense={dashboardData.metrics.monthlyExpense}
            netCashflow={dashboardData.metrics.netCashflow}
            savingsRate={dashboardData.metrics.savingsRate}
            monthlyBudgetLimit={dashboardData.metrics.monthlyBudgetLimit}
            walletCount={dashboardData.wallets.length}
            monthLabel={dashboardData.metrics.monthLabel}
            dataSource={dashboardData.dataSource}
          />
        </div>

        <div className="min-w-0 xl:col-span-4">
          <InsightPokoAI
            insights={dashboardData.aiInsights}
            updatedAt={dashboardData.aiInsightUpdatedAt}
          />
        </div>
      </div>

      {/* Row 2: Multi-Wallet Strip + Modal Tambah Dompet */}
      <WalletStrip wallets={dashboardData.wallets} dataSource={dashboardData.dataSource} />

      {/* Row 3: Recent Transactions (7 col) + Impian & Tabungan Preview (5 col) */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <RecentTransactions transactions={dashboardData.recentTransactions} />
        </div>

        <div className="min-w-0 lg:col-span-5">
          <HomeDreamPreview
            dreams={dashboardData.activeDreams}
            primarySavingsBalance={dashboardData.metrics.primarySavingsBalance}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardHomeSkeleton />}>
      <DashboardHomeContent />
    </Suspense>
  );
}
