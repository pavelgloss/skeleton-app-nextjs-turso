import { expect, test } from "@playwright/test";

test("homepage shows the email form and auth links", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "skeleton-app" }),
  ).toBeVisible();
  await expect(page.getByLabel("Recipient email")).toBeVisible();
  await expect(page.getByLabel("Subject")).toBeVisible();
  await expect(page.getByLabel("Message")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
});
