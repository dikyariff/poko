import type { BlobatarFrame } from "@/lib/blobatar";

export interface DashboardUserProfile {
  id: string;
  firstName: string;
  displayName: string;
  /** Always normalized with leading "@" (e.g. "@nielpoko"). */
  handle: string;
  email: string | null;
  /** Deterministically derived from the user's Clerk profile (one unique avatar per user). */
  blobatarSeed: string;
  blobatarFrame: BlobatarFrame;
  privacyMode: boolean;
  profilePersisted: boolean;
  clerkEnabled: boolean;
}
