export function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  clerk: {
    publishableKey: requireEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    secretKey: requireEnv("CLERK_SECRET_KEY"),
  },
  turso: {
    databaseUrl: requireEnv("TURSO_DATABASE_URL"),
    authToken: requireEnv("TURSO_AUTH_TOKEN"),
  },
  openai: {
    apiKey: requireEnv("OPENAI_API_KEY"),
  },
  resend: {
    apiKey: requireEnv("RESEND_API_KEY"),
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;
