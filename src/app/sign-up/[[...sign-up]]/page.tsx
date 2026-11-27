import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCardSkeleton, AuthWidget } from "@/components/auth/auth-widget";

export const metadata: Metadata = {
  title: "Daftar — Poko",
  description: "Buat akun Poko Planner baru — Kantong rapi, impian pasti.",
};

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <Suspense fallback={<AuthCardSkeleton />}>
        <AuthWidget mode="sign-up" />
      </Suspense>
    </AuthShell>
  );
}
