import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { pokoClerkAppearance } from "@/lib/clerk-appearance";
import { CLERK_URLS, isClerkPublishableKeyConfigured } from "@/lib/clerk-config";

interface PokoClerkProviderProps {
  children: ReactNode;
}

/**
 * Membungkus aplikasi dengan <ClerkProvider> saat Publishable Key tersedia.
 * Jika env key belum diisi di .env.local, children tetap dirender secara aman
 * agar build & pratinjau lokal tidak crash (fail-closed tetap dijaga di proxy & API).
 */
export function PokoClerkProvider({ children }: PokoClerkProviderProps) {
  if (!isClerkPublishableKeyConfigured()) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      appearance={pokoClerkAppearance}
      signInUrl={CLERK_URLS.signInUrl}
      signUpUrl={CLERK_URLS.signUpUrl}
      signInFallbackRedirectUrl={CLERK_URLS.signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={CLERK_URLS.signUpFallbackRedirectUrl}
    >
      {children}
    </ClerkProvider>
  );
}
