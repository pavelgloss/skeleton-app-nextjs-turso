import { desc } from "drizzle-orm";

import { HomePageDemo } from "@/components/home-page-demo";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userRows = await getDb()
    .select({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.id));

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="text-muted-foreground text-sm">
              Public technical preview of the `users` table.
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 font-medium">id</th>
                  <th className="px-3 py-2 font-medium">clerk_id</th>
                  <th className="px-3 py-2 font-medium">email</th>
                  <th className="px-3 py-2 font-medium">created_at</th>
                </tr>
              </thead>
              <tbody>
                {userRows.length === 0 ? (
                  <tr>
                    <td
                      className="text-muted-foreground px-3 py-4"
                      colSpan={4}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  userRows.map((user) => (
                    <tr key={user.id} className="border-b align-top">
                      <td className="px-3 py-2">{user.id}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {user.clerkId}
                      </td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">
                        {user.createdAt.toISOString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-center">
          <HomePageDemo />
        </div>
      </div>
    </main>
  );
}
