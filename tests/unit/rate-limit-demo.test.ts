import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();
const insertMock = vi.fn();
const deleteMock = vi.fn();
const warnMock = vi.fn();

vi.mock("@/db", () => {
  const fromMock = vi.fn();
  const whereMock = vi.fn();

  selectMock.mockReturnValue({ from: fromMock });
  fromMock.mockReturnValue({ where: whereMock });
  whereMock.mockReturnValue([{ count: 0 }]);

  const valuesWhereMock = vi.fn();
  const valuesMock = vi.fn().mockReturnValue({});
  insertMock.mockReturnValue({ values: valuesMock });

  deleteMock.mockReturnValue({ where: valuesWhereMock });
  valuesWhereMock.mockReturnValue({});

  return {
    db: {
      select: selectMock,
      insert: insertMock,
      delete: deleteMock,
    },
  };
});

vi.mock("@/db/schema", () => ({
  rateLimits: {
    ip: "ip",
    endpoint: "endpoint",
    createdAt: "created_at",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: warnMock,
    error: vi.fn(),
  },
}));

function makeRequest(ip = "127.0.0.1"): NextRequest {
  return new NextRequest("http://localhost:3000/api/rate-limit-demo", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

describe("POST /api/rate-limit-demo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when under rate limit", async () => {
    const fromMock = vi.fn();
    const whereMock = vi.fn();
    selectMock.mockReturnValue({ from: fromMock });
    fromMock.mockReturnValue({ where: whereMock });
    whereMock.mockReturnValue([{ count: 0 }]);

    const valuesMock = vi.fn().mockReturnValue({});
    insertMock.mockReturnValue({ values: valuesMock });

    const deleteWhereMock = vi.fn().mockReturnValue({});
    deleteMock.mockReturnValue({ where: deleteWhereMock });

    const { POST } = await import("@/app/api/rate-limit-demo/route");
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
  });

  it("returns 429 when rate limit exceeded", async () => {
    const fromMock = vi.fn();
    const whereMock = vi.fn();
    selectMock.mockReturnValue({ from: fromMock });
    fromMock.mockReturnValue({ where: whereMock });
    // First check (1min window) returns count >= limit
    whereMock.mockReturnValue([{ count: 10 }]);

    const { POST } = await import("@/app/api/rate-limit-demo/route");
    const response = await POST(makeRequest());

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Too Many Requests");
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(warnMock).toHaveBeenCalled();
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const headers = new Headers({ "x-real-ip": "9.8.7.6" });
    expect(getClientIp(headers)).toBe("9.8.7.6");
  });

  it("returns unknown when no IP headers", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });
});
