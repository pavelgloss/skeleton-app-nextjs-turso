import { expect, test } from "@playwright/test";

test("dashboard redirects unauthenticated users to sign-in", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in/);
});
