import { NextRequest, NextResponse } from "next/server";

import { BaseEmail } from "@/emails/base-email";
import { apiHandler } from "@/lib/api-handler";
import { getResend } from "@/lib/email";

export const POST = apiHandler(async (req: NextRequest) => {
  const { to, subject, text } = await req.json();

  if (!to || !subject || !text) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, text" },
      { status: 400 },
    );
  }

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: "skeleton-app <onboarding@resend.dev>",
    to,
    subject,
    react: BaseEmail({ subject, body: text }),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id });
});
