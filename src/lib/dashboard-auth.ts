import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import type { DashboardUserProfile } from "@/components/layout/types";
import {
  DEFAULT_DISPLAY_NAME,
  DEFAULT_HANDLE,
  deriveClerkBlobatarSeed,
  extractFirstName,
} from "@/lib/blobatar";
import { CLERK_URLS, isClerkServerConfigured } from "@/lib/clerk-config";
import { getOrCreateProfile } from "@/lib/profile-server";

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
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);

  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const clerkDisplayName =
    fullName || user?.username?.trim() || email?.split("@")[0] || DEFAULT_DISPLAY_NAME;

  const clerkHandle = user?.username?.trim() ? `@${user.username.trim()}` : DEFAULT_HANDLE;

  const clerkSeed = deriveClerkBlobatarSeed({
    id: userId ?? user?.id ?? null,
    username: user?.username ?? null,
    email,
  });

  const { profile, persisted } = await getOrCreateProfile({
    userId: userId ?? user?.id ?? null,
    clerkSeed,
    fallbackDisplayName: clerkDisplayName,
    fallbackHandle: clerkHandle,
  });

  return {
    id: profile.id,
    firstName: extractFirstName(profile.display_name),
    displayName: profile.display_name,
    handle: profile.handle,
    email,
    blobatarSeed: profile.blobatar_seed,
    blobatarFrame: profile.blobatar_frame,
    privacyMode: profile.privacy_mode,
    profilePersisted: persisted,
    clerkEnabled: true,
  };
}
