import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isClerkServerConfigured } from "@/lib/clerk-config";

export async function GET() {
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

  const { isAuthenticated, userId, sessionId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Silakan masuk untuk mengakses data akun." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      userId,
      sessionId,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
