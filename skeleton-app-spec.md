# skeleton-app — Implementation Specification

> **Purpose:** Generic skeleton web app template with auth, email, AI route, and DB.
> Ready for future projects — minimal UI, maximal infrastructure.
>
> **Target:** AI agent implements this spec without questions.
> Execute tasks sequentially. Each task must pass its acceptance criteria before moving to the next.

---

## Tech Stack (exact versions)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x (latest) |
| Language | TypeScript | 5.x (strict mode) |
| Runtime | Node.js | 22.x LTS |
| Package manager | pnpm | latest |
| Bundler (dev) | Turbopack | built-in (Next.js 16 default) |
| UI | shadcn/ui + Tailwind CSS v4 | latest |
| Auth | Clerk | @clerk/nextjs latest |
| Database | Turso (libSQL) + Drizzle ORM | latest |
| AI | Vercel AI SDK + OpenAI | ai + @ai-sdk/openai latest |
| Email | Resend + React Email | latest |
| Toast | sonner | latest |
| Logging | pino | latest |
| Unit/Integration tests | Vitest + @testing-library/react + jsdom | latest |
| E2E tests | Playwright | latest |
| Linting | ESLint (flat config) | 9.x |
| Formatting | Prettier | 3.x |
| CI | GitHub Actions | N/A |
| Deploy | Vercel | via CLI |

---

## Environment Variables

File: `.env.local.example` (committed to repo, no real values)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Turso
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-token

# OpenAI
OPENAI_API_KEY=sk-xxx

# Resend
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Project Structure (final state)

```
skeleton-app/
├── .github/
│   └── workflows/
│       └── ci.yml
├── drizzle/                         ← generated migrations (gitignored initially)
├── public/
│   └── (empty, placeholder)
├── scripts/
│   └── smoke-test.mjs               ← post-deploy verification
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← ClerkProvider + Toaster
│   │   ├── page.tsx                  ← public: email form
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx          ← Clerk <SignIn />
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx          ← Clerk <SignUp />
│   │   ├── dashboard/
│   │   │   └── page.tsx              ← protected: user info + logout
│   │   └── api/
│   │       ├── send-email/
│   │       │   └── route.ts          ← POST: Resend email
│   │       ├── chat/
│   │       │   └── route.ts          ← POST: OpenAI completion
│   │       └── health/
│   │           └── route.ts          ← GET: connectivity check
│   ├── db/
│   │   ├── schema.ts                 ← Drizzle table definitions
│   │   ├── index.ts                  ← Turso client + Drizzle instance
│   │   └── migrate.ts               ← migration runner (run with tsx)
│   ├── emails/
│   │   └── base-email.tsx            ← React Email universal template
│   ├── lib/
│   │   ├── env.ts                    ← env validation (no Zod)
│   │   ├── logger.ts                 ← pino logger
│   │   ├── email.ts                  ← Resend client
│   │   ├── api-handler.ts            ← API route error wrapper
│   │   ├── user-sync.ts              ← Clerk→DB on-demand sync
│   │   └── utils.ts                  ← cn() helper (shadcn)
│   ├── middleware.ts                 ← Clerk auth middleware
│   └── components/
│       └── ui/                       ← shadcn generated components
├── tests/
│   ├── unit/
│   │   ├── send-email.test.ts
│   │   ├── chat.test.ts
│   │   ├── health.test.ts
│   │   ├── env.test.ts
│   │   └── email-form.test.tsx       ← React component test
│   └── e2e/
│       ├── homepage.spec.ts
│       └── auth-redirect.spec.ts
├── .env.local.example
├── .gitignore
├── .nvmrc                            ← Node version pin
├── .prettierrc
├── .prettierignore
├── CLAUDE.md                         ← AI agent instructions
├── AGENTS.md                         ← agent workflow rules
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

---

## TASK 1: Project Init + Core Config

### 1.1 Create Next.js project

```bash
pnpm create next-app@latest skeleton-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --turbopack
```

After scaffolding, verify `package.json` has `next@16.x` and `react@19.x`.

### 1.2 `.nvmrc`

```
22
```

### 1.3 `tsconfig.json`

Ensure these settings exist (merge with generated config):

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.4 `package.json` scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "smoke": "node scripts/smoke-test.mjs"
  }
}
```

### 1.5 ESLint flat config — `eslint.config.mjs`

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
```

### 1.6 Prettier — `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80
}
```

### 1.7 `.prettierignore`

```
.next
node_modules
drizzle
pnpm-lock.yaml
```

### 1.8 `.gitignore`

Extend the generated `.gitignore` to include:

```
# env
.env
.env.local
.env.*.local

# turso
*.db

# drizzle
drizzle/meta

# playwright
test-results/
playwright-report/

# misc
.DS_Store
*.tsbuildinfo
```

### 1.9 Dev dependencies to add

```bash
pnpm add -D tsx prettier @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom @types/node
```

### Acceptance criteria — Task 1
- `pnpm dev` starts without errors
- `pnpm lint` passes
- `pnpm format:check` passes
- TypeScript strict mode enabled
- `.nvmrc` exists with value `22`

---

## TASK 2: shadcn/ui Init

### 2.1 Initialize shadcn

```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

This creates `components.json` and `src/lib/utils.ts` with `cn()` helper.

### 2.2 Add required components

```bash
pnpm dlx shadcn@latest add button input card textarea
```

### 2.3 Install sonner

```bash
pnpm add sonner
```

### Acceptance criteria — Task 2
- `components.json` exists at project root
- `src/components/ui/button.tsx`, `input.tsx`, `card.tsx`, `textarea.tsx` exist
- `src/lib/utils.ts` exists with `cn()` function
- `pnpm build` passes

---

## TASK 3: Core Libraries

### 3.1 `src/lib/env.ts` — Environment validation (NO Zod)

```ts
function requireEnv(key: string): string {
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
```

**Important:** This file must be imported lazily (inside functions), NOT at module top-level in client components. It reads `process.env` which is server-only. For API routes and server components, direct import is fine.

### 3.2 `src/lib/logger.ts` — Pino logger

```bash
pnpm add pino
```

```ts
import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
```

Dev dependency:

```bash
pnpm add -D pino-pretty
```

### 3.3 `src/lib/api-handler.ts` — API route error wrapper

```ts
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

type HandlerFn = (req: NextRequest) => Promise<NextResponse>;

export function apiHandler(handler: HandlerFn): HandlerFn {
  return async (req: NextRequest) => {
    const start = Date.now();
    const { method, url } = req;

    try {
      const response = await handler(req);
      logger.info({ method, url, status: response.status, ms: Date.now() - start });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error({ method, url, error: message, ms: Date.now() - start });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
```

### 3.4 `src/lib/email.ts` — Resend client

```bash
pnpm add resend @react-email/components
```

```ts
import { Resend } from "resend";

// Lazy init to avoid env read at import time
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}
```

### Acceptance criteria — Task 3
- All four files exist under `src/lib/`
- No Zod imports anywhere in the project
- `pnpm build` passes
- Logger outputs to console in dev

---

## TASK 4: Clerk Auth

### 4.1 Install

```bash
pnpm add @clerk/nextjs
```

### 4.2 `src/middleware.ts`

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### 4.3 `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "skeleton-app",
  description: "Skeleton app template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 4.4 Sign-in page — `src/app/sign-in/[[...sign-in]]/page.tsx`

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### 4.5 Sign-up page — `src/app/sign-up/[[...sign-up]]/page.tsx`

```tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

### 4.6 Dashboard — `src/app/dashboard/page.tsx`

```tsx
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Sync user to DB on first visit
  await syncUser(user);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p>Přihlášen jako {user.emailAddresses[0]?.emailAddress}</p>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
```

### 4.7 Clerk Dashboard configuration (manual step — document in README)

In Clerk Dashboard (clerk.com):
1. Create application
2. Under **Social connections**: enable **Google** and **Facebook** only
3. Disable **Email + Password** (under Email, Phone, Username)
4. Set redirect URLs per env vars

### Acceptance criteria — Task 4
- Unauthenticated user visiting `/dashboard` gets redirected to `/sign-in`
- `/sign-in` renders Clerk sign-in component with Google + Facebook buttons
- `/sign-up` renders Clerk sign-up component with Google + Facebook buttons
- After login, user sees `/dashboard` with their email and logout button
- No email+password option visible on sign-in/sign-up

---

## TASK 5: Database (Turso + Drizzle)

### 5.1 Install

```bash
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

### 5.2 `drizzle.config.ts`

```ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
```

### 5.3 `src/db/schema.ts`

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### 5.4 `src/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

### 5.5 `src/db/migrate.ts`

```ts
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

Run with: `pnpm db:migrate` (which calls `tsx src/db/migrate.ts`)

### 5.6 `src/lib/user-sync.ts` — Clerk→DB on-demand sync

```ts
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import type { User as ClerkUser } from "@clerk/nextjs/server";

export async function syncUser(clerkUser: ClerkUser): Promise<void> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .get();

  if (!existing) {
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown";
    await db.insert(users).values({
      clerkId: clerkUser.id,
      email,
    });
    logger.info({ clerkId: clerkUser.id, email }, "New user synced to DB");
  }
}
```

### Acceptance criteria — Task 5
- `pnpm db:push` creates the `users` table in Turso
- `pnpm db:migrate` runs without errors
- `pnpm db:studio` opens Drizzle Studio and shows `users` table
- After login via Clerk, user row appears in `users` table
- Second login of same user does NOT create duplicate row

---

## TASK 6: Email (Resend + React Email)

### 6.1 `src/emails/base-email.tsx`

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BaseEmailProps {
  subject: string;
  body: string;
  previewText?: string;
}

export function BaseEmail({ subject, body, previewText }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText || subject}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>{subject}</Heading>
          <Section>
            <Text style={textStyle}>{body}</Text>
          </Section>
          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            Sent from skeleton-app
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const headingStyle = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#1a1a1a",
  marginBottom: "16px",
};

const textStyle = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
};

const hrStyle = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerStyle = {
  fontSize: "12px",
  color: "#8898aa",
};
```

### 6.2 `src/app/api/send-email/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/email";
import { BaseEmail } from "@/emails/base-email";
import { apiHandler } from "@/lib/api-handler";

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
```

**Note:** `from` address uses `onboarding@resend.dev` (Resend's sandbox). For production, configure a custom domain in Resend dashboard.

### Acceptance criteria — Task 6
- `POST /api/send-email` with `{ "to": "test@example.com", "subject": "Test", "text": "Hello" }` returns `{ success: true, id: "..." }`
- Recipient receives a styled HTML email (not plain text)
- Missing fields return 400 error

---

## TASK 7: OpenAI Route

### 7.1 Install

```bash
pnpm add ai @ai-sdk/openai
```

### 7.2 `src/app/api/chat/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { apiHandler } from "@/lib/api-handler";

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Missing required field: prompt (string)" },
      { status: 400 },
    );
  }

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
  });

  return NextResponse.json({ response: text });
});
```

### Acceptance criteria — Task 7
- `POST /api/chat` without auth returns 401
- `POST /api/chat` with valid auth + `{ "prompt": "Say hello" }` returns `{ "response": "..." }`
- Uses `gpt-4o-mini` model (cheapest, sufficient for skeleton)

---

## TASK 8: Health Check

### 8.1 `src/app/api/health/route.ts`

```ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // DB check
  try {
    await db.run(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Clerk check (just verify env vars exist)
  checks.clerk =
    process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      ? "ok"
      : "error";

  // OpenAI check (verify key exists, don't make API call)
  checks.openai = process.env.OPENAI_API_KEY ? "ok" : "error";

  // Resend check (verify key exists)
  checks.resend = process.env.RESEND_API_KEY ? "ok" : "error";

  const allOk = Object.values(checks).every((v) => v === "ok");
  const status = allOk ? 200 : 503;

  if (!allOk) {
    logger.warn({ checks }, "Health check failed");
  }

  return NextResponse.json({ status: allOk ? "healthy" : "degraded", checks }, { status });
}
```

### Acceptance criteria — Task 8
- `GET /api/health` returns `{ "status": "healthy", "checks": { ... } }` with status 200 when all services connected
- Returns 503 with `"degraded"` when any check fails
- DB check actually queries the database

---

## TASK 9: Public Homepage (Email Form)

### 9.1 `src/app/page.tsx`

Minimal page with:
- App title "skeleton-app" as `<h1>`
- Link to `/sign-in` ("Sign In") and `/sign-up` ("Sign Up") — plain links or shadcn `<Button variant="outline">`
- Horizontal divider
- Email form with three fields:
  - "Recipient email" — `<Input type="email" />` (required)
  - "Subject" — `<Input type="text" />` (required)
  - "Message" — `<Textarea />` (required)
  - "Send" — `<Button type="submit" />`
- On submit: POST to `/api/send-email`
- On success: `toast.success("Email sent!")`
- On error: `toast.error("Failed to send email")`
- Form resets after successful send
- Use `"use client"` directive (form has client-side state)

**Styling:** Centered card layout, max-width ~480px. No images, no colors beyond shadcn defaults. Absolute minimum CSS.

### Acceptance criteria — Task 9
- Homepage renders email form
- Sign In / Sign Up links navigate to Clerk pages
- Submitting form with valid data sends email and shows success toast
- Submitting with missing fields shows HTML5 validation (required attribute)
- Error from API shows error toast

---

## TASK 10: Smoke Test Script

### 10.1 `scripts/smoke-test.mjs`

```js
#!/usr/bin/env node

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function check(name, url, expectedStatus = 200) {
  try {
    const res = await fetch(url);
    if (res.status === expectedStatus) {
      console.log(`✓ ${name} (${res.status})`);
      return true;
    }
    console.error(`✗ ${name} — expected ${expectedStatus}, got ${res.status}`);
    return false;
  } catch (err) {
    console.error(`✗ ${name} — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`\nSmoke testing ${BASE_URL}\n`);
  const results = await Promise.all([
    check("Homepage", `${BASE_URL}/`),
    check("Health", `${BASE_URL}/api/health`),
    check("Sign-in page", `${BASE_URL}/sign-in`),
  ]);

  const allPassed = results.every(Boolean);
  console.log(allPassed ? "\n✓ All checks passed" : "\n✗ Some checks failed");
  process.exit(allPassed ? 0 : 1);
}

main();
```

### Acceptance criteria — Task 10
- `pnpm smoke` (with app running) outputs green checks for all endpoints
- Exit code 0 on success, 1 on failure

---

## TASK 11: Testing — Vitest

### 11.1 `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 11.2 `tests/unit/setup.ts`

```ts
import "@testing-library/jest-dom/vitest";
```

### 11.3 Unit tests to implement

**`tests/unit/env.test.ts`:**
- Test that `requireEnv` throws when env var is missing
- Test that it returns value when env var exists

**`tests/unit/chat.test.ts`:**
- Mock OpenAI response
- Test that unauthenticated request returns 401
- Test that missing prompt returns 400
- Test that valid request returns response

**`tests/unit/send-email.test.ts`:**
- Mock Resend
- Test that missing fields return 400
- Test that valid request returns success

**`tests/unit/health.test.ts`:**
- Mock DB
- Test that healthy state returns 200
- Test that DB failure returns 503

**`tests/unit/email-form.test.tsx`:**
- Render homepage
- Assert form fields exist (email input, subject, textarea, send button)
- Assert Sign In / Sign Up links exist

### Acceptance criteria — Task 11
- `pnpm test` runs all unit tests and passes
- At least 5 test files exist
- React component test renders without errors

---

## TASK 12: Testing — Playwright E2E

### 12.1 Install and init

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

### 12.2 `playwright.config.ts`

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### 12.3 E2E tests to implement

**`tests/e2e/homepage.spec.ts`:**
- Homepage loads and displays email form
- Form has all required fields
- Sign In and Sign Up links are visible

**`tests/e2e/auth-redirect.spec.ts`:**
- Visiting `/dashboard` without auth redirects to `/sign-in`

### Acceptance criteria — Task 12
- `pnpm test:e2e` runs and passes
- Tests use Chromium only (fastest CI)

---

## TASK 13: GitHub Actions CI

### 13.1 `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: latest

      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm build
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_placeholder
          CLERK_SECRET_KEY: sk_test_placeholder
          TURSO_DATABASE_URL: file:local.db
          TURSO_AUTH_TOKEN: placeholder
          OPENAI_API_KEY: sk-placeholder
          RESEND_API_KEY: re_placeholder
          NEXT_PUBLIC_APP_URL: http://localhost:3000

      - run: pnpm test
        env:
          TURSO_DATABASE_URL: file:local.db
          TURSO_AUTH_TOKEN: placeholder
          OPENAI_API_KEY: sk-placeholder
          RESEND_API_KEY: re_placeholder
          CLERK_SECRET_KEY: sk_test_placeholder
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_placeholder
```

**Note:** Playwright E2E tests are NOT run in CI in this skeleton (they require running app + real Clerk). Add later when needed.

### Acceptance criteria — Task 13
- Push to `main` triggers CI
- CI runs lint, format check, build, and unit tests
- CI passes with placeholder env vars

---

## TASK 14: CLAUDE.md + AGENTS.md

### 14.1 `CLAUDE.md`

This file instructs Claude Code (or any AI agent) how to work with this project. Content:

```markdown
# CLAUDE.md — AI Agent Instructions

## Project
skeleton-app — Next.js 16 skeleton template with Clerk auth, Turso DB, OpenAI, Resend.

## Commands
- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier (write)
- `pnpm test` — Vitest unit tests
- `pnpm test:e2e` — Playwright E2E
- `pnpm db:push` — push schema to Turso
- `pnpm db:migrate` — run migrations
- `pnpm smoke` — post-deploy health check

## Architecture
- App Router (src/app/)
- API routes in src/app/api/ — always use apiHandler wrapper from src/lib/api-handler.ts
- Database: Turso (SQLite) via Drizzle ORM — schema in src/db/schema.ts
- Auth: Clerk (Google + Facebook only, no email+password)
- Email: Resend + React Email templates in src/emails/
- Logging: pino (use logger from src/lib/logger.ts, never console.log)
- Env validation: src/lib/env.ts (no Zod in this project)

## Conventions
- TypeScript strict mode, no `any`
- Use `@/` path alias for imports
- API routes use apiHandler() wrapper for consistent error handling + logging
- New DB tables go in src/db/schema.ts
- New email templates go in src/emails/
- Tests: unit in tests/unit/, e2e in tests/e2e/
- Run `pnpm lint` and `pnpm test` before committing

## Do NOT
- Add Zod to this project
- Add email+password authentication
- Use console.log (use logger)
- Create API routes without apiHandler wrapper
- Skip TypeScript types (no `any`, no `as unknown as X` hacks)
```

### 14.2 `AGENTS.md`

```markdown
# AGENTS.md — Agent Workflow Rules

## Task Execution
1. Read CLAUDE.md first for project context
2. Before making changes, run `pnpm build` to verify current state
3. After changes, run `pnpm lint && pnpm test` to verify nothing is broken
4. If adding a new API route, always use apiHandler wrapper
5. If adding a new DB table, add it to src/db/schema.ts and run `pnpm db:push`

## File Creation Rules
- New pages go in src/app/
- New API routes go in src/app/api/{name}/route.ts
- New shared utilities go in src/lib/
- New React components go in src/components/ (NOT in src/app/)
- New email templates go in src/emails/
- New tests go in tests/unit/ or tests/e2e/

## PR Checklist
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] No new `console.log` statements (use logger)
- [ ] No `any` types
- [ ] API routes use apiHandler wrapper
```

### Acceptance criteria — Task 14
- Both files exist at project root
- Content is accurate to the project setup

---

## TASK 15: README.md

Write a concise README with:

1. **Project name + one-line description**
2. **Prerequisites:** Node 22, pnpm, Turso CLI, Clerk account, OpenAI key, Resend key
3. **Quick start:**
   - `pnpm install`
   - Copy `.env.local.example` to `.env.local` and fill in values
   - `pnpm db:push`
   - `pnpm dev`
4. **Available scripts** (table of all scripts from package.json)
5. **Clerk setup** — steps to configure Google + Facebook in Clerk dashboard
6. **Deploy to Vercel** — `vercel` CLI steps
7. **Project structure** — brief overview (reference this spec for detail)

### Acceptance criteria — Task 15
- README exists and covers all sections above
- A developer with all API keys can go from clone to running app in under 5 minutes

---

## Final Verification Checklist

After all tasks are complete, verify:

- [ ] `pnpm install` — no errors
- [ ] `pnpm lint` — no errors
- [ ] `pnpm format:check` — no errors
- [ ] `pnpm build` — no errors
- [ ] `pnpm test` — all unit tests pass
- [ ] `pnpm dev` — app starts on localhost:3000
- [ ] Homepage shows email form + Sign In / Sign Up links
- [ ] `/sign-in` shows Clerk login (Google + Facebook only)
- [ ] `/dashboard` redirects to sign-in when not authenticated
- [ ] After login, dashboard shows email + logout button
- [ ] After login, user row exists in Turso DB
- [ ] `POST /api/send-email` sends real email via Resend
- [ ] `POST /api/chat` returns OpenAI response (requires auth)
- [ ] `GET /api/health` returns healthy status
- [ ] `pnpm smoke` passes against running app
- [ ] `CLAUDE.md` and `AGENTS.md` exist and are accurate
- [ ] No Zod imports anywhere in codebase
- [ ] No `console.log` anywhere (only pino logger)
- [ ] No `any` types in TypeScript
