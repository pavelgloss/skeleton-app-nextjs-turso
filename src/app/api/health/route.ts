import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { logger } from "@/lib/logger";
import type { HealthCheckStatus } from "@/types/api";

export async function GET() {
  const checks: Record<string, HealthCheckStatus> = {};

  try {
    await db.run(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  checks.clerk =
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      ? "ok"
      : "error";

  checks.openai = process.env.OPENAI_API_KEY ? "ok" : "error";
  checks.resend = process.env.RESEND_API_KEY ? "ok" : "error";

  const allOk = Object.values(checks).every((value) => value === "ok");
  const status = allOk ? 200 : 503;

  if (!allOk) {
    logger.warn({ checks }, "Health check failed");
  }

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      checks,
    },
    { status },
  );
}
