import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
const getResendMock = vi.fn();
const getResendFromEmailMock = vi.fn();

vi.mock("@/lib/email", () => ({
  getResend: getResendMock,
  getResendFromEmail: getResendFromEmailMock,
  isResendSandboxSender: (from: string) =>
    from.includes("onboarding@resend.dev"),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
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
    getResendFromEmailMock.mockReturnValue(
      "skeleton-app <onboarding@resend.dev>",
    );
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
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "skeleton-app <onboarding@resend.dev>",
        to: "test@example.com",
        subject: "Test",
        text: "Hello",
      }),
    );
  });

  it("returns Resend status and an actionable message when provider rejects the email", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 403,
        message:
          "You can only send testing emails to your own email address (pavel.gloss@gmail.com).",
      },
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

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error:
        "You can only send testing emails to your own email address (pavel.gloss@gmail.com). Set RESEND_FROM_EMAIL to an address on a verified Resend domain to deliver to other recipients.",
    });
  });
});
