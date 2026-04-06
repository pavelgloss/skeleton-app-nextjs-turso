import { and, eq, gt, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";
import { logger } from "@/lib/logger";

interface RateLimitWindow {
  windowSeconds: number;
  maxRequests: number;
}

const DEFAULT_WINDOWS: RateLimitWindow[] = [
  { windowSeconds: 60, maxRequests: 10 }, // 10 per minute
  { windowSeconds: 3600, maxRequests: 100 }, // 100 per hour
];

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  limit?: number;
  remaining?: number;
  windowSeconds?: number;
}

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  windows: RateLimitWindow[] = DEFAULT_WINDOWS,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const db = getDb();

  // Check each window
  for (const window of windows) {
    const cutoff = now - window.windowSeconds;

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.ip, ip),
          eq(rateLimits.endpoint, endpoint),
          gt(rateLimits.createdAt, cutoff),
        ),
      );

    const count = result.count;

    if (count >= window.maxRequests) {
      logger.warn(
        { ip, endpoint, count, window: window.windowSeconds },
        "Rate limit exceeded",
      );

      return {
        allowed: false,
        retryAfterSeconds: window.windowSeconds,
        limit: window.maxRequests,
        remaining: 0,
        windowSeconds: window.windowSeconds,
      };
    }
  }

  // Record the request
  await db.insert(rateLimits).values({ ip, endpoint, createdAt: now });

  // Return info from the tightest window (first one)
  const tightest = windows[0];
  const cutoff = now - tightest.windowSeconds;
  const [current] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.ip, ip),
        eq(rateLimits.endpoint, endpoint),
        gt(rateLimits.createdAt, cutoff),
      ),
    );

  return {
    allowed: true,
    limit: tightest.maxRequests,
    remaining: tightest.maxRequests - current.count,
    windowSeconds: tightest.windowSeconds,
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return headers.get("x-real-ip") ?? "unknown";
}
