"use client";

import * as React from "react";
import { RefreshCw, Sparkles } from "lucide-react";

import { BlobatarAvatar } from "@/components/blobatar/blobatar-avatar";
import { Button } from "@/components/ui/button";
import type { BlobatarMood } from "@/lib/blobatar";
import type { PokoAiInsightItem } from "@/lib/home-dashboard-data";
import { cn } from "@/lib/utils";

export interface InsightPokoAIProps {
  insights: PokoAiInsightItem[];
  updatedAt?: string | null;
}

const MOOD_BADGE_CLASS: Record<BlobatarMood, string> = {
  hyped: "bg-lime text-ink",
  happy: "bg-yellow text-ink",
  love: "bg-lime text-ink",
  thinking: "bg-cyan text-ink",
  chill: "bg-peach text-ink",
  broke: "bg-coral text-ink",
};

const DEFAULT_FALLBACK_INSIGHT: PokoAiInsightItem = {
  mood: "happy",
  badge: "Mode Santai",
  text: "Mulai catat transaksimu hari ini biar Poko AI bisa bantu baca pola arus kas dan target impianmu!",
  source: "deterministic",
};

export function InsightPokoAI({ insights, updatedAt }: InsightPokoAIProps) {
  const safeInsights = insights.length > 0 ? insights : [DEFAULT_FALLBACK_INSIGHT];
  const [activeIndex, setActiveIndex] = React.useState(0);

  const normalizedIndex = activeIndex % safeInsights.length;
  const activeInsight = safeInsights[normalizedIndex] ?? DEFAULT_FALLBACK_INSIGHT;
  const hasMultiple = safeInsights.length > 1;

  function handleCycleInsight() {
    setActiveIndex((prev) => (prev + 1) % safeInsights.length);
  }

  return (
    <section
      aria-labelledby="insight-poko-ai-heading"
      data-slot="insight-poko-ai"
      className="border-ink bg-lavender shadow-brutal flex h-full min-w-0 flex-col justify-between gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6"
    >
      {/* Header: Poko AI Buddy Blobatar + Status Badge */}
      <div className="flex items-center gap-3.5">
        <BlobatarAvatar
          seed="poko-ai-coach"
          frame="rounded"
          mood={activeInsight.mood}
          size="md"
          trackCursor
          animateIdle
          interactive
          className="bg-card shrink-0"
          ariaLabel={`Poko AI Coach sedang dalam ekspresi ${activeInsight.mood}`}
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h2
              id="insight-poko-ai-heading"
              className="font-display text-ink truncate text-base leading-tight font-bold sm:text-lg"
            >
              Insight Poko AI
            </h2>
            <Sparkles className="text-ink size-4 shrink-0" aria-hidden="true" />
          </div>

          <span
            data-slot="ai-mood-badge"
            className={cn(
              "border-ink shadow-brutal-sm inline-flex max-w-full items-center truncate rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold",
              MOOD_BADGE_CLASS[activeInsight.mood]
            )}
          >
            {activeInsight.badge}
          </span>
        </div>
      </div>

      {/* Insight Quote Box */}
      <div className="border-ink bg-card flex flex-1 items-center rounded-2xl border-[2.5px] p-4 shadow-[2px_2px_0px_#111111]">
        <p data-slot="ai-insight-text" className="text-ink text-sm leading-relaxed font-semibold">
          {activeInsight.text}
        </p>
      </div>

      {/* Footer: Counter/Source + Cycle Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-ink font-mono text-[11px] font-extrabold">
          {hasMultiple
            ? `Tip ${normalizedIndex + 1} / ${safeInsights.length}`
            : activeInsight.source === "gemini"
              ? "Poko AI · Gemini"
              : "Poko AI · Real-time"}
          {activeInsight.source === "gemini" && updatedAt ? " · Tersimpan" : ""}
        </span>

        {hasMultiple ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCycleInsight}
            data-testid="btn-cycle-ai-insight"
            className="min-h-9 px-3 text-xs font-extrabold"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Insight Lainnya
          </Button>
        ) : (
          <span className="border-ink bg-card rounded-full border-2 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase">
            Live Coach
          </span>
        )}
      </div>
    </section>
  );
}
