import type { User as ClerkUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/lib/logger";

export async function syncUser(clerkUser: ClerkUser): Promise<void> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .get();

  if (!existing) {
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown";

    await db.insert(users).values({
      clerkId: clerkUser.id,
      email,
    });

    logger.info({ clerkId: clerkUser.id, email }, "New user synced to DB");
  }
}
