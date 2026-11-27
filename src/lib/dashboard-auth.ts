import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import type { DashboardUserProfile } from "@/components/layout/types";
import { CLERK_URLS, isClerkServerConfigured } from "@/lib/clerk-config";

export interface DashboardSessionInfo {
  userId: string;
  sessionId: string | null;
}

/**
 * Menjaga seluruh route /dashboard(.*) tetap fail-closed di server
 * (selain proteksi edge di src/proxy.ts).
 */
export async function requireDashboardSession(
  redirectPath = "/dashboard"
): Promise<DashboardSessionInfo> {
  await connection();

  if (!isClerkServerConfigured()) {
    redirect(`${CLERK_URLS.signInUrl}?redirect_url=${encodeURIComponent(redirectPath)}`);
  }

  const { userId, sessionId } = await auth.protect();
  return { userId, sessionId: sessionId ?? null };
}

export async function getDashboardUserProfile(): Promise<DashboardUserProfile> {
  const user = await currentUser();

  const firstName =
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Teman";

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const displayName =
    fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "Teman Poko";

  const rawHandle =
    user?.username ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "poko";
  const handle = rawHandle.toLowerCase().replace(/[^a-z0-9_]/g, "") || "poko";

  return {
    firstName,
    displayName,
    handle,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    avatarSeed: user?.username || user?.id || handle,
    clerkEnabled: true,
  };
}
