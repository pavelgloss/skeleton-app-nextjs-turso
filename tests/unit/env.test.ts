import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

const requiredEnv = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test",
  CLERK_SECRET_KEY: "sk_test",
  TURSO_DATABASE_URL: "file:test.db",
  TURSO_AUTH_TOKEN: "token",
  OPENAI_API_KEY: "sk-openai",
  RESEND_API_KEY: "re_test",
};

describe("requireEnv", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, ...requiredEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when the environment variable is missing", async () => {
    const { requireEnv } = await import("@/lib/env");

    delete process.env.TEST_KEY;

    expect(() => requireEnv("TEST_KEY")).toThrow(
      "Missing required environment variable: TEST_KEY",
    );
  });

  it("returns the environment variable value when present", async () => {
    const { requireEnv } = await import("@/lib/env");

    process.env.TEST_KEY = "available";

    expect(requireEnv("TEST_KEY")).toBe("available");
  });
});
