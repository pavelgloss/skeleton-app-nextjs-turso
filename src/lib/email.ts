import { Resend } from "resend";

const defaultFromEmail = "skeleton-app <onboarding@resend.dev>";

let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("Missing required environment variable: RESEND_API_KEY");
    }

    resend = new Resend(apiKey);
  }

  return resend;
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || defaultFromEmail;
}

export function isResendSandboxSender(from: string): boolean {
  return from.includes("onboarding@resend.dev");
}
