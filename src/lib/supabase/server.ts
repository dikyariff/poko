import { auth } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { assertSupabaseConfig, getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

export type ServerAccessTokenProvider = () => Promise<string | null>;
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Factory internal saat pemanggil sudah memiliki fungsi `getToken` dari Clerk `await auth()`.
 */
export function createServerSupabaseClientWithToken(
  getToken: ServerAccessTokenProvider
): TypedSupabaseClient {
  const config = assertSupabaseConfig();

  return createClient<Database>(config.url, config.publishableKey, {
    async accessToken() {
      return (await getToken()) ?? null;
    },
  });
}

/**
 * Membuat Supabase client di Server Components, Server Actions, atau Route Handlers
 * menggunakan pola resmi Clerk Native Third-Party Auth (`accessToken` callback).
 * Melempar error yang jelas jika env Supabase belum dikonfigurasi.
 */
export async function createServerSupabaseClient(): Promise<TypedSupabaseClient> {
  const { getToken } = await auth();
  return createServerSupabaseClientWithToken(() => getToken());
}

/**
 * Varian aman yang mengembalikan `null` saat env Supabase belum diisi,
 * cocok untuk diagnostic endpoint atau pratinjau lokal sebelum project Supabase aktif.
 */
export async function createOptionalServerSupabaseClient(): Promise<TypedSupabaseClient | null> {
  if (!getSupabaseConfig()) {
    return null;
  }

  return createServerSupabaseClient();
}
