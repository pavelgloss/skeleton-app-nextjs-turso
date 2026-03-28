import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runMock = vi.fn();
const warnMock = vi.fn();
const originalEnv = { ...process.env };

vi.mock("@/db", () => ({
  db: {
    run: runMock,
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: warnMock,
  },
}));

async function getRoute() {
  vi.resetModules();
  return (await import("@/app/api/health/route")).GET;
}

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      CLERK_SECRET_KEY: "sk_test",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test",
      OPENAI_API_KEY: "sk-openai",
      RESEND_API_KEY: "re_test",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns healthy when every check passes", async () => {
    runMock.mockResolvedValue({});
    const GET = await getRoute();

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "healthy",
      checks: {
        database: "ok",
        clerk: "ok",
        openai: "ok",
        resend: "ok",
      },
    });
    expect(warnMock).not.toHaveBeenCalled();
  });

  it("returns degraded when the database check fails", async () => {
    runMock.mockRejectedValue(new Error("Database unavailable"));
    const GET = await getRoute();

    const response = await GET();

    expect(response.status).toBe(503);

    await expect(response.json()).resolves.toEqual({
      status: "degraded",
      checks: {
        database: "error",
        clerk: "ok",
        openai: "ok",
        resend: "ok",
      },
    });
    expect(warnMock).toHaveBeenCalledTimes(1);
  });
});
