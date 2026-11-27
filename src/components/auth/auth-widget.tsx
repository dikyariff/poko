import { SignIn, SignUp } from "@clerk/nextjs";
import { KeyRound, Lock, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { pokoEmbeddedAuthAppearance } from "@/lib/clerk-appearance";
import { CLERK_URLS, isClerkPublishableKeyConfigured } from "@/lib/clerk-config";

interface AuthWidgetProps {
  mode: "sign-in" | "sign-up";
}

export function AuthCardSkeleton() {
  return (
    <div className="bg-card flex w-full flex-col gap-4 p-6 sm:p-7">
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-2 h-11 w-full rounded-[10px]" />
      <Skeleton className="h-11 w-full rounded-[10px]" />
      <Skeleton className="h-11 w-full rounded-[10px]" />
    </div>
  );
}

export function AuthWidget({ mode }: AuthWidgetProps) {
  const isSignIn = mode === "sign-in";

  if (isClerkPublishableKeyConfigured()) {
    if (isSignIn) {
      return (
        <SignIn
          routing="path"
          path={CLERK_URLS.signInUrl}
          signUpUrl={CLERK_URLS.signUpUrl}
          fallbackRedirectUrl={CLERK_URLS.signInFallbackRedirectUrl}
          appearance={pokoEmbeddedAuthAppearance}
        />
      );
    }

    return (
      <SignUp
        routing="path"
        path={CLERK_URLS.signUpUrl}
        signInUrl={CLERK_URLS.signInUrl}
        fallbackRedirectUrl={CLERK_URLS.signUpFallbackRedirectUrl}
        appearance={pokoEmbeddedAuthAppearance}
      />
    );
  }

  // Fallback Neo-Brutalist saat env keys Clerk belum diisi
  return (
    <div className="bg-card">
      <div className="space-y-5 p-6 sm:p-7">
        <div className="space-y-1">
          <h1 className="font-display text-ink text-2xl font-bold tracking-tight">
            {isSignIn ? "Masuk ke Poko" : "Buat Akun Poko"}
          </h1>
          <p className="text-ink-muted text-sm font-medium">
            {isSignIn
              ? "Gunakan akun Clerk kamu untuk membuka kantong & impian."
              : "Daftar sekali untuk menyinkronkan catatan keuanganmu."}
          </p>
        </div>

        <div
          role="status"
          className="border-ink bg-yellow/55 shadow-brutal-sm flex items-start gap-3 rounded-xl border-2 p-3.5"
        >
          <KeyRound className="text-ink mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 space-y-1 text-xs leading-relaxed">
            <p className="text-ink font-extrabold">Menunggu Konfigurasi Env Clerk</p>
            <p className="text-ink-muted font-medium">
              Salin <code className="text-ink font-mono font-bold">.env.example</code> ke{" "}
              <code className="text-ink font-mono font-bold">.env.local</code> lalu isi{" "}
              <code className="text-ink font-mono font-bold">
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
              </code>{" "}
              &amp; <code className="text-ink font-mono font-bold">CLERK_SECRET_KEY</code> untuk
              mengaktifkan komponen live Clerk{" "}
              <code className="text-ink font-mono font-bold">
                {isSignIn ? "<SignIn />" : "<SignUp />"}
              </code>
              .
            </p>
          </div>
        </div>

        <div className="space-y-3.5 opacity-80" aria-disabled="true">
          <Button type="button" variant="outline" className="w-full" disabled>
            Lanjutkan dengan Google (Clerk OAuth)
          </Button>

          <div className="flex items-center gap-3">
            <span className="bg-ink/20 h-[2px] flex-1" aria-hidden="true" />
            <span className="text-ink-muted font-mono text-[11px] font-bold uppercase">atau</span>
            <span className="bg-ink/20 h-[2px] flex-1" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`preview-email-${mode}`}
              className="text-ink flex items-center gap-1.5 text-xs font-extrabold tracking-wide uppercase"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              Alamat Email
            </label>
            <Input
              id={`preview-email-${mode}`}
              type="email"
              placeholder="kamu@contoh.id"
              disabled
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`preview-password-${mode}`}
              className="text-ink flex items-center gap-1.5 text-xs font-extrabold tracking-wide uppercase"
            >
              <Lock className="size-3.5" aria-hidden="true" />
              Kata Sandi
            </label>
            <Input
              id={`preview-password-${mode}`}
              type="password"
              placeholder="••••••••••••"
              disabled
              readOnly
            />
          </div>

          <Button type="button" variant="default" className="w-full font-extrabold" disabled>
            {isSignIn ? "Masuk ke Poko" : "Buat Akun Baru"}
          </Button>
        </div>
      </div>

      <div className="border-ink bg-subtle flex flex-wrap items-center justify-center gap-1.5 border-t-[2.5px] px-6 py-4 text-sm">
        <span className="text-ink-muted font-medium">
          {isSignIn ? "Belum punya akun Poko?" : "Sudah punya akun Poko?"}
        </span>
        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="text-ink decoration-ink hover:bg-lime rounded-sm px-1 font-bold underline decoration-[2.5px] underline-offset-4 transition-colors"
        >
          {isSignIn ? "Daftar sekarang" : "Masuk di sini"}
        </Link>
      </div>
    </div>
  );
}
