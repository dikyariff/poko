import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BlobatarBackdrop } from "@/components/auth/blobatar-backdrop";

interface AuthShellProps {
  mode: "sign-in" | "sign-up";
  children: ReactNode;
}

/**
 * Shell halaman autentikasi Poko:
 * 1 kotak Neo-Brutalist tunggal terpusat di atas latar belakang Blobatar tersebar & blur lembut.
 */
export function AuthShell({ mode, children }: AuthShellProps) {
  const isSignIn = mode === "sign-in";

  return (
    <main className="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <BlobatarBackdrop />

      <section
        aria-label={isSignIn ? "Masuk ke Poko Planner" : "Daftar Poko Planner"}
        className="border-ink bg-card shadow-brutal-lg relative z-10 w-full max-w-[440px] overflow-hidden rounded-[24px] border-[2.5px]"
      >
        {/* Header Brand Ringkas di dalam 1 Kotak Utama */}
        <header className="border-ink bg-subtle flex items-center justify-between gap-3 border-b-[2.5px] px-5 py-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
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
              <p className="text-ink-muted mt-0.5 truncate text-xs font-semibold">
                Kantong rapi, impian pasti
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="border-ink bg-card text-ink hover:bg-yellow inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[9px] border-2 px-2.5 py-1 text-xs font-bold transition-colors"
            aria-label="Kembali ke beranda Poko"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Beranda
          </Link>
        </header>

        {/* Isi Formulir Clerk menyatu langsung tanpa kotak ganda */}
        <div className="w-full min-w-0">{children}</div>
      </section>
    </main>
  );
}
