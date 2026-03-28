import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const generateTextMock = vi.fn();
const openaiMock = vi.fn((model: string) => model);

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
}));

vi.mock("ai", () => ({
  generateText: generateTextMock,
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: openaiMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

async function getRoute() {
  vi.resetModules();
  return (await import("@/app/api/chat/route")).POST;
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    authMock.mockResolvedValue({ userId: null });
    const POST = await getRoute();

    const response = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: "Say hello" }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("returns 400 when prompt is missing", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    const POST = await getRoute();

    const response = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing required field: prompt (string)",
    });
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("returns generated text for an authenticated user", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    generateTextMock.mockResolvedValue({ text: "Hello from AI" });
    const POST = await getRoute();

    const response = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: "Say hello" }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      response: "Hello from AI",
    });
    expect(openaiMock).toHaveBeenCalledWith("gpt-4o-mini");
    expect(generateTextMock).toHaveBeenCalledWith({
      model: "gpt-4o-mini",
      prompt: "Say hello",
    });
  });
});
