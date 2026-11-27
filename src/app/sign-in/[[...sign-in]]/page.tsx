import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCardSkeleton, AuthWidget } from "@/components/auth/auth-widget";

export const metadata: Metadata = {
  title: "Masuk — Poko",
  description: "Masuk ke akun Poko Planner kamu — Kantong rapi, impian pasti.",
};

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <Suspense fallback={<AuthCardSkeleton />}>
        <AuthWidget mode="sign-in" />
      </Suspense>
    </AuthShell>
  );
}
