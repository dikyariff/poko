import { auth } from "@clerk/nextjs/server";
import { connection, NextResponse } from "next/server";

import { isClerkServerConfigured } from "@/lib/clerk-config";
import { getSupabaseConfig, getSupabasePublicStatus } from "@/lib/supabase/config";
import { createServerSupabaseClientWithToken } from "@/lib/supabase/server";

interface WhoAmIClerkPayload {
  sub?: string | null;
  role?: string | null;
  iss?: string | null;
}

function extractClerkSub(data: unknown): {
  sub: string | null;
  role: string | null;
  iss: string | null;
} {
  if (typeof data === "string") {
    return { sub: data, role: null, iss: null };
  }

  if (data && typeof data === "object") {
    const payload = data as WhoAmIClerkPayload;
    return {
      sub: typeof payload.sub === "string" ? payload.sub : null,
      role: typeof payload.role === "string" ? payload.role : null,
      iss: typeof payload.iss === "string" ? payload.iss : null,
    };
  }

  return { sub: null, role: null, iss: null };
}

function isMissingRpcError(code: string | undefined, message: string | undefined): boolean {
  if (code === "PGRST202" || code === "42883") {
    return true;
  }

  if (!message) {
    return false;
  }

  const lower = message.toLowerCase();
  return lower.includes("whoami_clerk_sub") && lower.includes("could not find the function");
}

function isJwtRejectedError(code: string | undefined, message: string | undefined): boolean {
  if (code === "PGRST301" || code === "PGRST302" || code === "PGRST303") {
    return true;
  }

  if (!message) {
    return false;
  }

  const lower = message.toLowerCase();
  return (
    lower.includes("no suitable key") ||
    lower.includes("jwt") ||
    lower.includes("jws") ||
    lower.includes("invalid token")
  );
}

export async function GET() {
  await connection();

  if (!isClerkServerConfigured()) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        reason: "clerk_not_configured",
        message: "Clerk environment keys belum dikonfigurasi di .env.local.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { isAuthenticated, userId, getToken } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Silakan masuk untuk menjalankan verifikasi koneksi Supabase.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const publicStatus = getSupabasePublicStatus();
  const config = getSupabaseConfig();

  if (!config || !publicStatus.configured) {
    return NextResponse.json(
      {
        status: "not_configured",
        configured: false,
        authMode: "clerk-native-third-party-auth",
        clerkUserId: userId,
        supabaseHost: publicStatus.host,
        keySource: publicStatus.keySource,
        jwtSubMatch: null,
        rpcAvailable: null,
        message:
          "Supabase environment variables belum diisi. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local lalu aktifkan Clerk di Supabase Third-Party Auth.",
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const clerkToken = await getToken();
  if (!clerkToken) {
    return NextResponse.json(
      {
        status: "missing_clerk_token",
        configured: true,
        authMode: "clerk-native-third-party-auth",
        clerkUserId: userId,
        supabaseHost: publicStatus.host,
        keySource: publicStatus.keySource,
        jwtSubMatch: false,
        rpcAvailable: null,
        message: "Token sesi Clerk tidak tersedia pada permintaan ini.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const supabase = createServerSupabaseClientWithToken(async () => clerkToken);

  try {
    const { data, error } = await supabase.rpc("whoami_clerk_sub");

    if (!error) {
      const claim = extractClerkSub(data);
      const jwtSubMatch = claim.sub === userId;

      return NextResponse.json(
        {
          status: jwtSubMatch ? "connected" : "sub_mismatch",
          configured: true,
          authMode: "clerk-native-third-party-auth",
          clerkUserId: userId,
          supabaseSub: claim.sub,
          supabaseRole: claim.role,
          supabaseHost: publicStatus.host,
          keySource: publicStatus.keySource,
          jwtSubMatch,
          rpcAvailable: true,
          message: jwtSubMatch
            ? "Koneksi Supabase + Clerk Native Third-Party Auth terverifikasi (auth.jwt()->>'sub' cocok dengan Clerk userId)."
            : "RPC whoami_clerk_sub berhasil dipanggil, namun nilai auth.jwt()->>'sub' tidak cocok dengan Clerk userId.",
        },
        {
          status: jwtSubMatch ? 200 : 502,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (isMissingRpcError(error.code, error.message)) {
      return NextResponse.json(
        {
          status: "rpc_missing",
          configured: true,
          authMode: "clerk-native-third-party-auth",
          clerkUserId: userId,
          supabaseHost: publicStatus.host,
          keySource: publicStatus.keySource,
          jwtSubMatch: null,
          rpcAvailable: false,
          errorCode: error.code ?? null,
          message:
            "Supabase menerima JWT Clerk, namun fungsi SQL `public.whoami_clerk_sub()` belum dipasang. Jalankan docs/supabase-clerk-auth-setup.sql di Supabase SQL Editor untuk verifikasi penuh auth.jwt()->>'sub'.",
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (error.code === "42501") {
      return NextResponse.json(
        {
          status: "missing_authenticated_role",
          configured: true,
          authMode: "clerk-native-third-party-auth",
          clerkUserId: userId,
          supabaseHost: publicStatus.host,
          keySource: publicStatus.keySource,
          jwtSubMatch: false,
          rpcAvailable: true,
          errorCode: error.code,
          message:
            "JWT Clerk diterima oleh Supabase tetapi tidak memiliki klaim role `authenticated`. Aktifkan integrasi Supabase di Clerk Dashboard -> Integrations -> Supabase.",
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (isJwtRejectedError(error.code, error.message)) {
      return NextResponse.json(
        {
          status: "auth_rejected",
          configured: true,
          authMode: "clerk-native-third-party-auth",
          clerkUserId: userId,
          supabaseHost: publicStatus.host,
          keySource: publicStatus.keySource,
          jwtSubMatch: false,
          rpcAvailable: null,
          errorCode: error.code ?? null,
          message:
            "Supabase menolak JWT Clerk (`" +
            (error.code ?? "JWT_ERROR") +
            "`). Pastikan Clerk sudah ditambahkan di Supabase Dashboard -> Authentication -> Third-Party Auth -> Add provider -> Clerk, dan integrasi Supabase aktif di Clerk Dashboard.",
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        configured: true,
        authMode: "clerk-native-third-party-auth",
        clerkUserId: userId,
        supabaseHost: publicStatus.host,
        keySource: publicStatus.keySource,
        jwtSubMatch: false,
        rpcAvailable: null,
        errorCode: error.code ?? null,
        message: error.message || "Gagal memverifikasi sesi Clerk ke Supabase.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan jaringan saat menghubungi Supabase.";

    return NextResponse.json(
      {
        status: "network_error",
        configured: true,
        authMode: "clerk-native-third-party-auth",
        clerkUserId: userId,
        supabaseHost: publicStatus.host,
        keySource: publicStatus.keySource,
        jwtSubMatch: false,
        rpcAvailable: null,
        message,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
