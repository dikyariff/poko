import type { Metadata } from "next";

import { RoutePlaceholderCard } from "@/components/dashboard/route-placeholder-card";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Laporan & Analitik — Poko",
  description: "Grafik arus kas bulanan dan ringkasan pengeluaran per kategori di Poko Planner.",
};

export default async function ReportsPage() {
  await requireDashboardSession("/dashboard/reports");

  return (
    <RoutePlaceholderCard
      badge="Phase 4 · Laporan"
      accentClass="bg-lavender/45"
      title="Laporan & Analitik Keuangan"
      description="Pantau rasio tabungan, kategori pengeluaran terbesar, dan perbandingan arus kas bulanan secara visual dengan tipografi angka tabular."
      roadmapNote="Halaman analitik & grafik interaktif siap dihubungkan ke agregasi Supabase pada tahap berikutnya."
      metrics={[
        {
          label: "Rata-rata Pengeluaran / Hari",
          amount: 148300,
          toneClass: "text-expense",
        },
        {
          label: "Rasio Tabungan Bulan Ini",
          textValue: "25,5%",
          toneClass: "text-income",
        },
        {
          label: "Sisa Batas Jajan",
          amount: 1275000,
          toneClass: "text-transfer",
        },
      ]}
    />
  );
}
