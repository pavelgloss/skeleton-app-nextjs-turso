import { NextRequest, NextResponse } from "next/server";

import { BaseEmail } from "@/emails/base-email";
import { apiHandler } from "@/lib/api-handler";
import {
  getResend,
  getResendFromEmail,
  isResendSandboxSender,
} from "@/lib/email";
import { logger } from "@/lib/logger";
import type { SendEmailRequest } from "@/types/api";

type ResendSendError = {
  message: string;
  name: string;
  statusCode: number | null;
};

function getResendErrorStatus(error: ResendSendError): number {
  if (
    typeof error.statusCode === "number" &&
    error.statusCode >= 400 &&
    error.statusCode < 600
  ) {
    return error.statusCode;
  }

  if (error.name === "validation_error") {
    return 400;
  }

  return 500;
}

function getResendErrorMessage(error: ResendSendError, from: string): string {
  const baseMessage = error.message || "Email provider rejected the request";

  if (
    isResendSandboxSender(from) &&
    baseMessage.includes("You can only send testing emails")
  ) {
    return `${baseMessage} Set RESEND_FROM_EMAIL to an address on a verified Resend domain to deliver to other recipients.`;
  }

  return baseMessage;
}

export const POST = apiHandler(async (req: NextRequest) => {
  const { to, subject, text } = (await req.json()) as SendEmailRequest;

  if (!to || !subject || !text) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, text" },
      { status: 400 },
    );
  }

  const resend = getResend();
  const from = getResendFromEmail();
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    react: BaseEmail({ subject, body: text }),
  });

  if (error) {
    const status = getResendErrorStatus(error);
    const message = getResendErrorMessage(error, from);

    logger.warn(
      {
        from,
        resendError: {
          name: error.name,
          statusCode: error.statusCode,
          message,
        },
      },
      "Resend rejected email",
    );

    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ success: true, id: data?.id });
});
