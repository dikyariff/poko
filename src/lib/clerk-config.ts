const PLACEHOLDER_MARKER = "replace_with_your";

function isValidKey(value: string | undefined, prefixes: readonly string[]): boolean {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed.length < 16 || trimmed.includes(PLACEHOLDER_MARKER)) {
    return false;
  }

  return prefixes.some((prefix) => trimmed.startsWith(prefix));
}

export function isClerkPublishableKeyConfigured(): boolean {
  return isValidKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, ["pk_test_", "pk_live_"]);
}

export function isClerkServerConfigured(): boolean {
  return (
    isClerkPublishableKeyConfigured() &&
    isValidKey(process.env.CLERK_SECRET_KEY, ["sk_test_", "sk_live_"])
  );
}

export const CLERK_URLS = {
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
  signInFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || "/",
  signUpFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/",
} as const;
