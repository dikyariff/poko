"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

import { PrivateAmount } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface PlaceholderMetric {
  label: string;
  amount?: number;
  prefix?: string;
  textValue?: string;
  toneClass?: string;
}

export interface RoutePlaceholderCardProps {
  badge: string;
  accentClass: string;
  title: string;
  description: string;
  roadmapNote: string;
  metrics: readonly PlaceholderMetric[];
}

export function RoutePlaceholderCard({
  badge,
  accentClass,
  title,
  description,
  roadmapNote,
  metrics,
}: RoutePlaceholderCardProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Card className={accentClass}>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-ink bg-card shadow-brutal-sm inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-extrabold uppercase">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {badge}
            </span>
            <span className="border-ink bg-subtle inline-flex items-center rounded-full border-2 px-3 py-1 font-mono text-xs font-bold">
              App Shell Siap
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
          <CardDescription className="text-ink/85 max-w-2xl text-sm font-medium sm:text-base">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="border-ink bg-card shadow-brutal-sm min-w-0 rounded-2xl border-[2.5px] p-4"
              >
                <p className="text-ink-muted text-xs font-bold">{metric.label}</p>
                {metric.amount !== undefined ? (
                  <p
                    className={`mt-1.5 truncate text-lg font-extrabold ${metric.toneClass ?? "text-ink"}`}
                  >
                    <PrivateAmount amount={metric.amount} prefix={metric.prefix} />
                  </p>
                ) : (
                  <p
                    className={`mt-1.5 truncate font-mono text-lg font-extrabold tabular-nums ${metric.toneClass ?? "text-ink"}`}
                  >
                    {metric.textValue}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="border-ink bg-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 p-4">
            <p className="text-ink-muted text-xs leading-relaxed font-semibold sm:text-sm">
              {roadmapNote}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali ke Beranda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
