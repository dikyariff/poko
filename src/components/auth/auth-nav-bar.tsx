import { Show, SignOutButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, LogIn, LogOut, ShieldAlert, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { isClerkPublishableKeyConfigured } from "@/lib/clerk-config";

function AuthControlsFallback() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="border-ink bg-subtle inline-flex items-center rounded-full border-2 px-3 py-1 font-mono text-xs font-semibold">
        Memuat sesi...
      </span>
    </div>
  );
}

export function AuthNavBar() {
  const clerkReady = isClerkPublishableKeyConfigured();

  return (
    <nav
      aria-label="Navigasi Autentikasi Poko"
      className="border-ink bg-card shadow-brutal flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[2.5px] px-4 py-3.5 sm:px-6"
    >
      <Link href="/" className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="border-ink bg-lime shadow-brutal-sm font-display text-ink flex size-10 shrink-0 items-center justify-center rounded-[11px] border-[2.5px] text-xl leading-none font-bold"
        >
          P
        </span>
        <div className="min-w-0">
          <p
            translate="no"
            className="font-display text-ink text-lg leading-none font-bold tracking-tight"
          >
            Poko
          </p>
          <p className="text-ink-muted mt-0.5 text-xs font-semibold">Kantong rapi, impian pasti</p>
        </div>
      </Link>

      {clerkReady ? (
        <Suspense fallback={<AuthControlsFallback />}>
          <div className="flex flex-wrap items-center gap-2.5">
            <Show when="signed-out">
              <span className="border-ink bg-subtle inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold">
                <ShieldAlert className="size-3.5" aria-hidden="true" />
                Belum Masuk
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5" aria-hidden="true" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">
                  <LogIn className="size-3.5" aria-hidden="true" />
                  Masuk
                </Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/sign-up">
                  <UserPlus className="size-3.5" aria-hidden="true" />
                  Daftar
                </Link>
              </Button>
            </Show>

            <Show when="signed-in">
              <span className="border-ink bg-lime/70 inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Sesi Aktif
              </span>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5" aria-hidden="true" />
                  Dashboard
                </Link>
              </Button>
              <SignOutButton redirectUrl="/">
                <Button variant="outline" size="sm">
                  <LogOut className="size-3.5" aria-hidden="true" />
                  Keluar
                </Button>
              </SignOutButton>
              <UserButton />
            </Show>
          </div>
        </Suspense>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="border-ink bg-yellow/65 inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold">
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            Env Clerk Belum Diisi
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <LayoutDashboard className="size-3.5" aria-hidden="true" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/sign-in">
              <LogIn className="size-3.5" aria-hidden="true" />
              Masuk
            </Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/sign-up">
              <UserPlus className="size-3.5" aria-hidden="true" />
              Daftar
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
