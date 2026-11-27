"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupabaseKeySource } from "@/lib/supabase/config";

interface SupabaseHealthCardProps {
  initialConfigured: boolean;
  supabaseHost: string | null;
  keySource: SupabaseKeySource | null;
}

interface HealthCheckResult {
  status: string;
  configured?: boolean;
  clerkUserId?: string;
  supabaseSub?: string | null;
  supabaseRole?: string | null;
  jwtSubMatch?: boolean | null;
  rpcAvailable?: boolean | null;
  errorCode?: string | null;
  message?: string;
  httpStatus: number;
}

export function SupabaseHealthCard({
  initialConfigured,
  supabaseHost,
  keySource,
}: SupabaseHealthCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<HealthCheckResult | null>(null);

  async function handleRunHealthCheck() {
    setIsTesting(true);
    try {
      const response = await fetch("/api/supabase-health", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as Omit<HealthCheckResult, "httpStatus">;
      setResult({
        ...payload,
        httpStatus: response.status,
      });
    } catch (error) {
      setResult({
        status: "fetch_error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghubungi endpoint /api/supabase-health.",
        httpStatus: 0,
      });
    } finally {
      setIsTesting(false);
    }
  }

  const keyLabel =
    keySource === "publishable"
      ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      : keySource === "anon"
        ? "NEXT_PUBLIC_SUPABASE_ANON_KEY (fallback)"
        : "Belum diisi";

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" aria-hidden="true" />
            Koneksi Supabase + Clerk Auth
          </CardTitle>
          <CardDescription>
            Integrasi Clerk Native Third-Party Auth via callback{" "}
            <code className="text-ink font-mono text-xs font-bold">accessToken()</code> tanpa JWT
            template lama.
          </CardDescription>
        </div>

        <span
          className={`border-ink shadow-brutal-sm inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold uppercase ${
            initialConfigured ? "bg-lime text-ink" : "bg-yellow text-ink"
          }`}
        >
          {initialConfigured ? (
            <>
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Env Terkonfigurasi
            </>
          ) : (
            <>
              <AlertTriangle className="size-3.5" aria-hidden="true" />
              Menunggu Env Supabase
            </>
          )}
        </span>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border-ink bg-subtle rounded-xl border-2 p-3">
            <p className="text-ink-soft font-mono text-xs uppercase">Supabase Host</p>
            <p className="text-ink mt-0.5 truncate font-mono text-xs font-bold">
              {supabaseHost ?? "Belum diisi di .env.local"}
            </p>
          </div>

          <div className="border-ink bg-subtle rounded-xl border-2 p-3">
            <p className="text-ink-soft font-mono text-xs uppercase">API Key Mode</p>
            <p className="text-ink mt-0.5 truncate font-mono text-xs font-bold">{keyLabel}</p>
          </div>

          <div className="border-ink bg-subtle rounded-xl border-2 p-3">
            <p className="text-ink-soft font-mono text-xs uppercase">Auth Pattern</p>
            <p className="text-ink mt-0.5 truncate font-mono text-xs font-bold">
              Clerk Native Third-Party
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleRunHealthCheck}
            disabled={isTesting}
          >
            {isTesting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {isTesting ? "Menguji Koneksi..." : "Tes Koneksi Supabase"}
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/api/supabase-health" target="_blank" rel="noreferrer">
              Buka JSON /api/supabase-health
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {result ? (
          <div
            role="status"
            aria-live="polite"
            className={`border-ink shadow-brutal-sm space-y-2 rounded-xl border-2 p-4 ${
              result.status === "connected"
                ? "bg-lime/45"
                : result.status === "not_configured" || result.status === "rpc_missing"
                  ? "bg-yellow/45"
                  : "bg-coral/30"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-ink flex items-center gap-2 font-mono text-xs font-extrabold uppercase">
                {result.status === "connected" ? (
                  <CheckCircle2 className="text-income size-4" aria-hidden="true" />
                ) : result.status === "not_configured" || result.status === "rpc_missing" ? (
                  <AlertTriangle className="text-warning-text size-4" aria-hidden="true" />
                ) : (
                  <XCircle className="text-expense size-4" aria-hidden="true" />
                )}
                Status: {result.status}
              </p>
              <span className="border-ink bg-card rounded-md border-2 px-2 py-0.5 font-mono text-[11px] font-bold">
                HTTP {result.httpStatus || "ERR"}
              </span>
            </div>

            {result.message ? (
              <p className="text-ink text-xs leading-relaxed font-medium">{result.message}</p>
            ) : null}

            {result.jwtSubMatch !== undefined && result.jwtSubMatch !== null ? (
              <div className="border-ink/20 grid gap-2 border-t-2 pt-2 font-mono text-xs sm:grid-cols-2">
                <div>
                  <span className="text-ink-muted block text-[11px] uppercase">Clerk userId</span>
                  <span className="text-ink font-bold break-all">{result.clerkUserId ?? "-"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px] uppercase">
                    Supabase auth.jwt()-&gt;&gt;&apos;sub&apos;
                  </span>
                  <span className="text-ink font-bold break-all">
                    {result.supabaseSub ?? "-"} ({result.jwtSubMatch ? "MATCH" : "MISMATCH"})
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-ink-muted text-xs leading-relaxed">
            Klik tombol di atas untuk memanggil{" "}
            <code className="text-ink font-mono font-bold">/api/supabase-health</code> dan
            memverifikasi klaim{" "}
            <code className="text-ink font-mono font-bold">auth.jwt()-&gt;&gt;&apos;sub&apos;</code>{" "}
            melalui RPC{" "}
            <code className="text-ink font-mono font-bold">public.whoami_clerk_sub()</code> (SQL
            helper tersedia di{" "}
            <code className="text-ink font-mono font-bold">docs/supabase-clerk-auth-setup.sql</code>
            ).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
