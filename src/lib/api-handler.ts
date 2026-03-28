import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";

type HandlerFn = (req: NextRequest) => Promise<NextResponse>;

export function apiHandler(handler: HandlerFn): HandlerFn {
  return async (req: NextRequest) => {
    const start = Date.now();
    const { method, url } = req;

    try {
      const response = await handler(req);
      logger.info({
        method,
        url,
        status: response.status,
        ms: Date.now() - start,
      });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      logger.error({
        method,
        url,
        error: message,
        ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
