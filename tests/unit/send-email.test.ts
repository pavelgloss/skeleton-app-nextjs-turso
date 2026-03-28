import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
const getResendMock = vi.fn();

vi.mock("@/lib/email", () => ({
  getResend: getResendMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

async function getRoute() {
  vi.resetModules();
  return (await import("@/app/api/send-email/route")).POST;
}

describe("POST /api/send-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getResendMock.mockReturnValue({
      emails: {
        send: sendMock,
      },
    });
  });

  it("returns 400 when required fields are missing", async () => {
    const POST = await getRoute();

    const response = await POST(
      new NextRequest("http://localhost/api/send-email", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing required fields: to, subject, text",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns success when Resend accepts the email", async () => {
    sendMock.mockResolvedValue({
      data: { id: "email_123" },
      error: null,
    });
    const POST = await getRoute();

    const response = await POST(
      new NextRequest("http://localhost/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: "test@example.com",
          subject: "Test",
          text: "Hello",
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      id: "email_123",
    });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
