import { Suspense } from "react";
import type { Metadata } from "next";

import DreamsLoading from "@/app/dashboard/dreams/loading";
import { RoutePlaceholderCard } from "@/components/dashboard/route-placeholder-card";
import { MobileTabSlideContent } from "@/components/layout/mobile-tab-transition";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Impian & Tabungan — Poko",
  description: "Pantau Tabungan Utama dan progres seluruh target impian di Poko Planner.",
};

async function DreamsContent() {
  await requireDashboardSession("/dashboard/dreams");

  return (
    <MobileTabSlideContent>
      <RoutePlaceholderCard
        badge="Phase 3 · Impian & Tabungan"
        accentClass="bg-yellow/45"
        title="Impian & Tabungan Utama"
        description="Kelola Tabungan Utama dan target impian finansial kamu dalam satu ruang — lengkap dengan estimasi waktu tercapai dan alokasi rutin."
        roadmapNote="Seluruh nominal di halaman Impian & Tabungan tersinkron otomatis dengan Mode Privasi global (Rp. *****)."
        metrics={[
          {
            label: "Tabungan Utama (Preview)",
            amount: 1850000,
            toneClass: "text-transfer",
          },
          {
            label: "Target Impian Aktif (Preview)",
            amount: 15000000,
            toneClass: "text-ink",
          },
          {
            label: "Progres Rata-rata",
            textValue: "42%",
            toneClass: "text-income",
          },
        ]}
      />
    </MobileTabSlideContent>
  );
}

export default function DreamsPage() {
  return (
    <Suspense fallback={<DreamsLoading />}>
      <DreamsContent />
    </Suspense>
  );
}
