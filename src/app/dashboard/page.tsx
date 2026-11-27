import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

import DashboardLoading from "@/app/dashboard/loading";
import { HeroBalanceCard } from "@/components/dashboard/hero-balance-card";
import { HomeDreamPreview } from "@/components/dashboard/home-dream-preview";
import { InsightPokoAI } from "@/components/dashboard/insight-poko-ai";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletStrip } from "@/components/dashboard/wallet-strip";
import { MobileTabSlideContent } from "@/components/layout/mobile-tab-transition";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { getHomeDashboardData } from "@/lib/home-dashboard-data";

export const metadata: Metadata = {
  title: "Beranda Keuangan — Poko",
  description:
    "Ringkasan total saldo bersih, arus kas bulanan, dompet aktif, transaksi terbaru, Impian & Tabungan, serta Insight Poko AI.",
};

async function DashboardHomeContent() {
  const { userId } = await requireDashboardSession("/dashboard");
  const dashboardData = await getHomeDashboardData(userId);

  return (
    <MobileTabSlideContent className="gap-5 sm:gap-6">
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

      {/* Row 1: Hero Balance Card (7 col) + Multi-Wallet Card Deck (5 col) */}
      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
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

        <div className="min-w-0 xl:col-span-5">
          <WalletStrip wallets={dashboardData.wallets} dataSource={dashboardData.dataSource} />
        </div>
      </div>

      {/* Row 2: Recent Transactions (7 col) + Impian & Tabungan Preview (5 col) */}
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

      {/* Row 3: Insight Poko AI */}
      <InsightPokoAI
        insights={dashboardData.aiInsights}
        updatedAt={dashboardData.aiInsightUpdatedAt}
      />
    </MobileTabSlideContent>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardHomeContent />
    </Suspense>
  );
}
