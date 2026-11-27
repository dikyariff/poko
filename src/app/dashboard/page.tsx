import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  ReceiptText,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HeroBalanceCard } from "@/components/dashboard/hero-balance-card";
import { SupabaseHealthCard } from "@/components/dashboard/supabase-health-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { getSupabasePublicStatus } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Beranda Keuangan — Poko",
  description: "Ringkasan total saldo bersih, arus kas, dan status koneksi di Poko Planner.",
};

const QUICK_NAV_CARDS = [
  {
    href: "/dashboard/transactions",
    title: "Catatan Transaksi",
    description: "Kelola pemasukan, pengeluaran, transfer, dan filter kategori.",
    badge: "Tab 2",
    tone: "bg-cyan/45",
    icon: ReceiptText,
  },
  {
    href: "/dashboard/dreams",
    title: "Impian & Tabungan",
    description: "Atur Tabungan Utama serta target impian dengan progres otomatis.",
    badge: "Tab 3",
    tone: "bg-yellow/65",
    icon: Target,
  },
  {
    href: "/dashboard/reports",
    title: "Laporan & Analitik",
    description: "Pantau distribusi pengeluaran bulanan dan tren arus kas kamu.",
    badge: "Tab 4",
    tone: "bg-lavender/55",
    icon: BarChart3,
  },
  {
    href: "/dashboard/missions",
    title: "Misi & Anti Boncos",
    description: "Selesaikan misi hemat dan kumpulkan milestone finansial.",
    badge: "Tab 5",
    tone: "bg-peach/55",
    icon: Trophy,
  },
] as const;

export default async function DashboardPage() {
  const { userId, sessionId } = await requireDashboardSession("/dashboard");
  const supabaseStatus = getSupabasePublicStatus();

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Hero Balance Card dengan Tombol Privasi #1 + <PrivateAmount /> */}
      <HeroBalanceCard />

      {/* Quick Links ke 4 Tab Lain */}
      <section aria-label="Akses Cepat Ruang Poko" className="grid gap-4 sm:grid-cols-2">
        {QUICK_NAV_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="border-ink bg-card shadow-brutal group flex min-w-0 flex-col justify-between gap-4 rounded-[20px] border-[2.5px] p-5 transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#111111]"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`border-ink shadow-brutal-sm flex size-11 shrink-0 items-center justify-center rounded-xl border-2 ${item.tone}`}
                >
                  <Icon className="size-5 text-ink" aria-hidden="true" />
                </span>
                <span className="border-ink bg-subtle inline-flex items-center rounded-full border-2 px-2.5 py-0.5 font-mono text-[11px] font-bold">
                  {item.badge}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="font-display text-ink flex items-center justify-between gap-2 text-lg font-bold tracking-tight">
                  <span>{item.title}</span>
                  <ArrowRight
                    className="size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </h2>
                <p className="text-ink-muted text-sm leading-relaxed">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Status Ringkas Auth & Supabase */}
      <section className="grid gap-5 md:grid-cols-2" aria-label="Status Auth & Koneksi Supabase">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="text-income size-5" aria-hidden="true" />
                Status Sesi Clerk Terverifikasi
              </CardTitle>
              <CardDescription>
                Seluruh rute <code className="text-ink font-mono font-bold">/dashboard(.*)</code>{" "}
                terproteksi oleh <code className="text-ink font-mono font-bold">src/proxy.ts</code>{" "}
                dan <code className="text-ink font-mono font-bold">await auth.protect()</code>.
              </CardDescription>
            </div>
            <span className="border-ink bg-lime shadow-brutal-sm inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold uppercase">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Sesi Aktif
            </span>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-ink bg-subtle rounded-xl border-2 p-3">
                <p className="text-ink-soft font-mono text-xs uppercase">Clerk User ID</p>
                <p className="text-ink mt-0.5 truncate font-mono text-xs font-bold">{userId}</p>
              </div>
              <div className="border-ink bg-subtle rounded-xl border-2 p-3">
                <p className="text-ink-soft font-mono text-xs uppercase">Session ID</p>
                <p className="text-ink mt-0.5 truncate font-mono text-xs font-bold">
                  {sessionId ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/api/me" target="_blank" rel="noreferrer">
                  Cek JSON /api/me
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <SupabaseHealthCard
          initialConfigured={supabaseStatus.configured}
          supabaseHost={supabaseStatus.host}
          keySource={supabaseStatus.keySource}
        />
      </section>
    </div>
  );
}
