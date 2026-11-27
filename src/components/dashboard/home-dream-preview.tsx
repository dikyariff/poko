"use client";

import { ArrowRight, Link2, Sparkles, Target } from "lucide-react";
import Link from "next/link";

import { PrivateAmount } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { HomeDreamPreviewItem } from "@/lib/home-dashboard-data";
import { cn } from "@/lib/utils";

export interface HomeDreamPreviewProps {
  dreams: HomeDreamPreviewItem[];
  primarySavingsBalance: number;
}

const PROGRESS_TONES = ["default", "cyan", "lavender"] as const;

export function HomeDreamPreview({ dreams, primarySavingsBalance }: HomeDreamPreviewProps) {
  return (
    <section
      aria-labelledby="home-dream-preview-heading"
      data-slot="home-dream-preview"
      className="border-ink bg-card shadow-brutal flex h-full min-w-0 flex-col justify-between gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6"
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h2
              id="home-dream-preview-heading"
              className="font-display text-ink text-lg leading-snug font-bold tracking-tight"
            >
              Impian &amp; Tabungan
            </h2>
            <p className="text-ink-muted text-xs font-semibold sm:text-sm">
              Progres otomatis dari saldo dompet tabunganmu.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="min-h-9 shrink-0">
            <Link href="/dashboard/dreams">
              Kelola Impian
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Highlight Tabungan Utama */}
        <div className="border-ink bg-subtle flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 px-3.5 py-2.5">
          <span className="text-ink flex items-center gap-1.5 text-xs font-extrabold">
            <Sparkles className="text-income size-4 shrink-0" aria-hidden="true" />
            Tabungan Utama
          </span>
          <span className="text-transfer text-sm font-extrabold">
            <PrivateAmount amount={primarySavingsBalance} />
          </span>
        </div>

        {dreams.length === 0 ? (
          <div className="border-ink bg-subtle flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center">
            <span className="border-ink bg-yellow shadow-brutal-sm inline-flex size-12 items-center justify-center rounded-2xl border-2">
              <Target className="text-ink size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-ink text-base font-bold">
                Belum ada target Impian aktif
              </p>
              <p className="text-ink-muted max-w-xs text-xs leading-relaxed font-medium">
                Pasang target seperti Laptop Baru, Dana Darurat, atau Liburan — progresnya langsung
                tersinkron dari Tabungan Utama.
              </p>
            </div>
            <Button asChild variant="secondary" size="sm" className="min-h-10">
              <Link href="/dashboard/dreams">
                Buat Target Impian
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3.5">
            {dreams.map((dream, index) => {
              const isReady = dream.progressPercent >= 100;
              const tone = isReady ? "default" : PROGRESS_TONES[index % PROGRESS_TONES.length];

              return (
                <li
                  key={dream.id}
                  className="border-ink bg-subtle/75 flex min-w-0 flex-col gap-2.5 rounded-2xl border-2 p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display text-ink flex items-center gap-1.5 truncate text-sm leading-tight font-bold">
                        <span aria-hidden="true">{dream.emoji}</span>
                        <span className="truncate">{dream.title}</span>
                      </h3>
                      <span className="border-ink bg-card mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full border-[1.5px] px-2 py-0.5 text-[10px] font-extrabold">
                        <Link2 className="size-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{dream.linkedWalletName}</span>
                      </span>
                    </div>

                    <span
                      className={cn(
                        "border-ink shrink-0 rounded-full border-2 px-2.5 py-0.5 font-mono text-[11px] font-extrabold",
                        isReady ? "bg-lime text-ink" : "bg-card text-ink"
                      )}
                    >
                      {isReady ? "Siap Eksekusi!" : `${dream.progressPercent}%`}
                    </span>
                  </div>

                  <Progress
                    value={dream.progressPercent}
                    tone={tone}
                    className="h-3"
                    aria-label={`Progres impian ${dream.title}: ${dream.progressPercent}%`}
                  />

                  <div className="text-ink-muted flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                    <span className="text-ink">
                      <PrivateAmount amount={dream.currentAmount} />
                    </span>
                    <span>
                      Target <PrivateAmount amount={dream.targetAmount} />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
