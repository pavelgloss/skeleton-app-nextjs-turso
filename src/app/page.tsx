"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  ApiError,
  RateLimitDemoResponse,
  SendEmailRequest,
} from "@/types/api";

const initialForm: SendEmailRequest = {
  to: "",
  subject: "",
  text: "",
};

interface RateLimitState {
  ok?: boolean;
  error?: string;
  remaining?: string;
  limit?: string;
  retryAfterSeconds?: number;
}

export default function HomePage() {
  const [form, setForm] = useState<SendEmailRequest>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitResult, setRateLimitResult] =
    useState<RateLimitState | null>(null);
  const [isTestingRateLimit, setIsTestingRateLimit] = useState(false);

  async function handleRateLimitTest() {
    setIsTestingRateLimit(true);
    try {
      const response = await fetch("/api/rate-limit-demo", { method: "POST" });
      const data = (await response.json()) as
        | RateLimitDemoResponse
        | ApiError;
      setRateLimitResult({
        ...data,
        ok: "ok" in data ? data.ok : undefined,
        error: "error" in data ? data.error : undefined,
        retryAfterSeconds:
          "retryAfterSeconds" in data ? data.retryAfterSeconds : undefined,
        remaining: response.headers.get("X-RateLimit-Remaining") ?? undefined,
        limit: response.headers.get("X-RateLimit-Limit") ?? undefined,
      });
      if (response.ok) {
        toast.success("Request allowed");
      } else {
        const retryAfter =
          "retryAfterSeconds" in data ? data.retryAfterSeconds : "?";
        toast.error(`Rate limited! Retry after ${retryAfter}s`);
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setIsTestingRateLimit(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiError | null;

        throw new Error(payload?.error || "Failed to send email");
      }

      toast.success("Email sent!");
      setForm(initialForm);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send email";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-[480px]">
        <CardHeader className="gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              <h1>skeleton-app</h1>
            </CardTitle>
            <CardDescription>
              Minimal public page with auth links and email form.
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-t" />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="to">
                Recipient email
              </label>
              <Input
                id="to"
                name="to"
                type="email"
                required
                value={form.to}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    to: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="subject">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="text">
                Message
              </label>
              <Textarea
                id="text"
                name="text"
                required
                value={form.text}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                }
              />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </form>
          <div className="border-t" />
          <div className="space-y-3">
            <p className="text-sm font-medium">Rate Limit Demo</p>
            <p className="text-muted-foreground text-xs">
              Hit the endpoint repeatedly to see rate limiting in action.
            </p>
            <Button
              className="w-full"
              variant="outline"
              disabled={isTestingRateLimit}
              onClick={handleRateLimitTest}
            >
              {isTestingRateLimit ? "Testing..." : "Test Rate Limit"}
            </Button>
            {rateLimitResult && (
              <div className="bg-muted rounded-md p-3 text-xs font-mono space-y-1">
                <p>
                  Status:{" "}
                  {rateLimitResult.ok ? (
                    <span className="text-green-600">allowed</span>
                  ) : (
                    <span className="text-red-600">
                      rate limited (retry after {rateLimitResult.retryAfterSeconds}s)
                    </span>
                  )}
                </p>
                {rateLimitResult.limit && (
                  <p>
                    Remaining: {rateLimitResult.remaining}/{rateLimitResult.limit}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
