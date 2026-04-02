/**
 * Shared request/response types for API routes.
 * Import from both client components and API route handlers.
 */

// --- /api/send-email ---

export interface SendEmailRequest {
  to: string;
  subject: string;
  text: string;
}

export interface SendEmailResponse {
  success: boolean;
  id?: string;
}

// --- /api/chat ---

export interface ChatRequest {
  prompt: string;
}

export interface ChatResponse {
  response: string;
}

// --- /api/rate-limit-demo ---

export interface RateLimitDemoResponse {
  ok: boolean;
}

export interface RateLimitHeaders {
  remaining: string | null;
  limit: string | null;
}

// --- /api/health ---

export type HealthCheckStatus = "ok" | "error";

export interface HealthResponse {
  status: "healthy" | "degraded";
  checks: Record<string, HealthCheckStatus>;
}

// --- Common error shape ---

export interface ApiError {
  error: string;
  retryAfterSeconds?: number;
}
