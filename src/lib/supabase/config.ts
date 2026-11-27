const PLACEHOLDER_MARKERS = ["replace_with_your", "your-project-ref", "your_publishable_key"];

export type SupabaseKeySource = "publishable" | "anon";

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
  keySource: SupabaseKeySource;
}

export interface SupabasePublicStatus {
  configured: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  keySource: SupabaseKeySource | null;
  host: string | null;
}

function hasPlaceholderMarker(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker)) ||
    lower.startsWith("<") ||
    lower.endsWith(">")
  );
}

function parseValidSupabaseUrl(raw: string | undefined): URL | null {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed || hasPlaceholderMarker(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function parseValidSupabaseKey(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();
  if (trimmed.length < 16 || hasPlaceholderMarker(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Membaca dan memvalidasi konfigurasi Supabase dari environment variables publik.
 * Memprioritaskan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, dengan fallback kompatibel
 * ke NEXT_PUBLIC_SUPABASE_ANON_KEY jika tersedia.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const parsedUrl = parseValidSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = parseValidSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const anonKey = parseValidSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const resolvedKey = publishableKey ?? anonKey;
  if (!parsedUrl || !resolvedKey) {
    return null;
  }

  return {
    url: parsedUrl.origin,
    publishableKey: resolvedKey,
    keySource: publishableKey ? "publishable" : "anon",
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

/**
 * Mengembalikan metadata status konfigurasi Supabase yang aman untuk ditampilkan di UI/API
 * tanpa pernah mengekspos nilai key atau secret.
 */
export function getSupabasePublicStatus(): SupabasePublicStatus {
  const parsedUrl = parseValidSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = parseValidSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const anonKey = parseValidSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const keySource: SupabaseKeySource | null = publishableKey
    ? "publishable"
    : anonKey
      ? "anon"
      : null;

  return {
    configured: parsedUrl !== null && keySource !== null,
    hasUrl: parsedUrl !== null,
    hasKey: keySource !== null,
    keySource,
    host: parsedUrl?.host ?? null,
  };
}

export function assertSupabaseConfig(): SupabaseConfig {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local."
    );
  }
  return config;
}
