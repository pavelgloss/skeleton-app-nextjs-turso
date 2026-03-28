import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { syncUser } from "@/lib/user-sync";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await syncUser(user);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <p>Přihlášen jako {user.emailAddresses[0]?.emailAddress}</p>
      <UserButton />
    </div>
  );
}
