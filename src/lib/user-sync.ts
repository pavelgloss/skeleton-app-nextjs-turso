import type { User as ClerkUser } from "@clerk/nextjs/server";

export async function syncUser(_clerkUser: ClerkUser): Promise<void> {}
