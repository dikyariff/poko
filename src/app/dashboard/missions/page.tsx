import { Suspense } from "react";
import type { Metadata } from "next";

import MissionsLoading from "@/app/dashboard/missions/loading";
import { RoutePlaceholderCard } from "@/components/dashboard/route-placeholder-card";
import { MobileTabSlideContent } from "@/components/layout/mobile-tab-transition";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Misi & Anti Boncos — Poko",
  description: "Tantangan hemat harian, XP finansial, dan pelindung batas jajan di Poko Planner.",
};

async function MissionsContent() {
  await requireDashboardSession("/dashboard/missions");

  return (
    <MobileTabSlideContent>
      <RoutePlaceholderCard
        badge="Phase 4 · Misi"
        accentClass="bg-peach/45"
        title="Misi & Anti Boncos"
        description="Bangun kebiasaan finansial sehat lewat tantangan anti boncos, target nabung mingguan, dan pencapaian yang bikin kantong makin rapi."
        roadmapNote="Sistem misi, XP, dan tantangan anti boncos siap terhubung ke profil pengguna pada tahap berikutnya."
        metrics={[
          {
            label: "Level Finansial (Preview)",
            textValue: "Lv. 5",
            toneClass: "text-ink",
          },
          {
            label: "Target Hemat Minggu Ini",
            amount: 250000,
            toneClass: "text-income",
          },
          {
            label: "Misi Aktif",
            textValue: "3 Misi",
            toneClass: "text-transfer",
          },
        ]}
      />
    </MobileTabSlideContent>
  );
}

export default function MissionsPage() {
  return (
    <Suspense fallback={<MissionsLoading />}>
      <MissionsContent />
    </Suspense>
  );
}
