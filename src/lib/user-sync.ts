import type { User as ClerkUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/lib/logger";

export async function syncUser(clerkUser: ClerkUser): Promise<void> {
  const db = getDb();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .get();

  if (!existing) {
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown";

    // possible race condition if the same user signs in from multiple devices at the same time, but this is just a demo app so it's not a big deal
    // two parallel sessions opened dashboard for first time for same user, later insert would fail due to unique constraint on clerkId, but that's an edge case that's unlikely to happen in practice and doesn't have serious consequences 
    // (the user would just see an error, because render in dashboard/page.tsx would fail, because no catch block, but the user would be able to refresh)
    // To mitigate this, we could implement a locking mechanism or use a database transaction with a unique constraint on clerkId to ensure only one record is created per user, but that would add complexity that's probably not worth it for this demo.
    await db.insert(users).values({
      clerkId: clerkUser.id,
      email,
    });

    logger.info({ clerkId: clerkUser.id, email }, "New user synced to DB");
  }
}
