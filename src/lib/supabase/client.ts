"use client";

import { useSession } from "@clerk/nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

import { assertSupabaseConfig, getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

export type BrowserAccessTokenProvider = () => Promise<string | null>;

/**
 * Factory Supabase client untuk Client Components menggunakan Clerk Native Third-Party Auth.
 * Tidak menggunakan `@supabase/ssr` cookie auth karena sesi sepenuhnya dikelola oleh Clerk.
 */
export function createBrowserSupabaseClient(
  getToken: BrowserAccessTokenProvider
): SupabaseClient<Database> {
  const config = assertSupabaseConfig();

  return createClient<Database>(config.url, config.publishableKey, {
    async accessToken() {
      return (await getToken()) ?? null;
    },
  });
}

/**
 * React hook untuk mengakses Supabase client yang terautentikasi di Client Components.
 * Client di-memoize berdasarkan referensi `session` Clerk agar tidak re-instantiate
 * pada setiap render, dan otomatis diperbarui bila sesi berubah.
 *
 * Mengembalikan `null` apabila env Supabase belum dikonfigurasi.
 */
export function useSupabaseClient(): SupabaseClient<Database> | null {
  const { session } = useSession();

  return useMemo(() => {
    if (!getSupabaseConfig()) {
      return null;
    }

    return createBrowserSupabaseClient(async () => {
      return (await session?.getToken()) ?? null;
    });
  }, [session]);
}
