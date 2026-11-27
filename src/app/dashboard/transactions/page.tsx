import { Suspense } from "react";
import type { Metadata } from "next";

import { getTransactions, type TransactionWithWallets } from "@/actions/transactions";
import { ensureStarterWallets, getWallets } from "@/actions/wallets";
import TransactionsLoading from "@/app/dashboard/transactions/loading";
import { MobileTabSlideContent } from "@/components/layout/mobile-tab-transition";
import { getJakartaDateKey } from "@/components/transactions/transaction-utils";
import { TransactionsWorkspace } from "@/components/transactions/transactions-workspace";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import type { Wallet } from "@/types/database";

export const metadata: Metadata = {
  title: "Catatan Transaksi — Poko",
  description:
    "Riwayat pemasukan, pengeluaran, dan transfer antar dompet dengan pencarian cepat, multi-filter WIB, dan pencatatan atomik.",
};

async function TransactionsContent() {
  await requireDashboardSession("/dashboard/transactions");

  const [walletsResult, transactionsResult] = await Promise.all([
    getWallets(),
    getTransactions({ limit: 200 }),
  ]);

  let wallets: Wallet[] = [];
  let warningMessage: string | null = null;

  if (walletsResult.ok) {
    wallets = walletsResult.data;
    if (wallets.length === 0) {
      const starterResult = await ensureStarterWallets();
      if (starterResult.ok) {
        wallets = starterResult.data;
      } else {
        warningMessage = starterResult.error;
      }
    }
  } else {
    warningMessage = walletsResult.error;
  }

  let transactions: TransactionWithWallets[] = [];
  if (transactionsResult.ok) {
    transactions = transactionsResult.data;
  } else if (!warningMessage) {
    warningMessage = transactionsResult.error;
  }

  const todayKey = getJakartaDateKey(new Date());

  return (
    <MobileTabSlideContent className="gap-5 sm:gap-6">
      <TransactionsWorkspace
        initialTransactions={transactions}
        wallets={wallets}
        todayKey={todayKey}
        warningMessage={warningMessage}
      />
    </MobileTabSlideContent>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsLoading />}>
      <TransactionsContent />
    </Suspense>
  );
}
