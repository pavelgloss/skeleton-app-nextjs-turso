import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/api-handler";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIp(req.headers);
  const result = await checkRateLimit(ip, "/api/rate-limit-demo");

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        retryAfterSeconds: result.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfterSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    },
  );
});
