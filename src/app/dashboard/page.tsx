import { SignOutButton, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, CheckCircle2, LogOut, ShieldCheck, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CLERK_URLS, isClerkServerConfigured } from "@/lib/clerk-config";

export const metadata: Metadata = {
  title: "Dashboard — Poko",
  description: "Ruang pribadi terlindungi untuk mengelola kantong & impian di Poko Planner.",
};

export default async function DashboardPage() {
  await connection();

  if (!isClerkServerConfigured()) {
    redirect(`${CLERK_URLS.signInUrl}?redirect_url=%2Fdashboard`);
  }

  const { userId, sessionId } = await auth.protect();
  const user = await currentUser();
  const displayName =
    user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "Teman Poko";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8 sm:py-12">
      <header className="border-ink bg-card shadow-brutal-lg flex flex-wrap items-center justify-between gap-4 rounded-3xl border-[2.5px] p-6 sm:p-8">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-ink bg-lime shadow-brutal-sm inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Rute Terproteksi
            </span>
            <span className="border-ink bg-subtle inline-flex items-center rounded-full border-2 px-3 py-1 font-mono text-xs font-semibold">
              Clerk Session Active
            </span>
          </div>
          <h1 className="font-display text-ink text-3xl font-bold tracking-tight sm:text-4xl">
            Halo, {displayName}!
          </h1>
          <p className="text-ink-muted max-w-xl text-sm leading-relaxed sm:text-base">
            Sesi autentikasi kamu aktif. Halaman ini diproteksi oleh{" "}
            <code className="font-mono font-bold">src/proxy.ts</code> dan{" "}
            <code className="font-mono font-bold">await auth.protect()</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <UserButton />
          <SignOutButton redirectUrl="/">
            <Button variant="outline" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              Keluar
            </Button>
          </SignOutButton>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Ringkasan Sesi Poko">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-income size-5" aria-hidden="true" />
              Detail Sesi Terverifikasi
            </CardTitle>
            <CardDescription>Data ini hanya dapat dibaca setelah login berhasil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="border-ink bg-subtle rounded-xl border-2 p-3">
              <p className="text-ink-soft font-mono text-xs uppercase">User ID</p>
              <p className="text-ink mt-0.5 truncate font-mono text-xs font-bold">{userId}</p>
            </div>
            <div className="border-ink bg-subtle rounded-xl border-2 p-3">
              <p className="text-ink-soft font-mono text-xs uppercase">Session ID</p>
              <p className="text-ink mt-0.5 truncate font-mono text-xs font-bold">
                {sessionId ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow/35">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5" aria-hidden="true" />
              Siap Masuk Fase Berikutnya
            </CardTitle>
            <CardDescription>
              Pondasi auth sudah beres — berikutnya kita hubungkan ke Supabase &amp; data kantong.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild variant="default" size="sm">
              <Link href="/api/me" target="_blank" rel="noreferrer">
                Cek JSON /api/me
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali ke Beranda
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
