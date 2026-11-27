import { Suspense } from "react";
import type { Metadata } from "next";

import { RoutePlaceholderCard } from "@/components/dashboard/route-placeholder-card";
import { MobileTabSlideContent } from "@/components/layout/mobile-tab-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Catatan Transaksi — Poko",
  description: "Riwayat pemasukan, pengeluaran, dan transfer dompet di Poko Planner.",
};

async function TransactionsContent() {
  await requireDashboardSession("/dashboard/transactions");

  return (
    <MobileTabSlideContent>
      <RoutePlaceholderCard
        badge="Phase 3 · Transaksi"
        accentClass="bg-cyan/35"
        title="Ruang Catatan Transaksi Siap Digunakan"
        description="Daftar transaksi multi-dompet, filter kategori, pencarian cepat, dan pemindaian struk AI akan tampil di halaman ini dengan sinkronisasi saldo atomik."
        roadmapNote="Mode Privasi sudah aktif di seluruh kartu preview. Modul CRUD Transaksi & RPC atomik dijadwalkan pada Task 8–11."
        metrics={[
          {
            label: "Total Pemasukan (Preview)",
            amount: 7250000,
            prefix: "+",
            toneClass: "text-income",
          },
          {
            label: "Total Pengeluaran (Preview)",
            amount: 2225000,
            prefix: "-",
            toneClass: "text-expense",
          },
          {
            label: "Arus Kas Bersih (Preview)",
            amount: 5025000,
            prefix: "+",
            toneClass: "text-ink",
          },
        ]}
      />
    </MobileTabSlideContent>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72 w-full rounded-[22px]" />}>
      <TransactionsContent />
    </Suspense>
  );
}
