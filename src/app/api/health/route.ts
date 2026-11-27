import { connection, NextResponse } from "next/server";

import { isClerkServerConfigured } from "@/lib/clerk-config";

export async function GET() {
  await connection();

  return NextResponse.json(
    {
      status: "ok",
      service: "poko-planner",
      authConfigured: isClerkServerConfigured(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
