# CLAUDE.md - AI Agent Instructions

## Project

skeleton-app - Next.js 16 skeleton template with Clerk auth, Turso DB, OpenAI, and Resend.

## Commands

- `pnpm dev` - start dev server (Turbopack)
- `pnpm build` - production build
- `pnpm lint` - ESLint
- `pnpm format` - Prettier (write)
- `pnpm test` - Vitest unit tests
- `pnpm test:e2e` - Playwright E2E
- `pnpm db:push` - push schema to database
- `pnpm db:migrate` - run migrations
- `pnpm smoke` - post-deploy health check

## Architecture

- App Router in `src/app/`
- API routes in `src/app/api/` and they should use `apiHandler` from `src/lib/api-handler.ts`
- Request protection lives in `src/proxy.ts` because Next.js 16 renamed `middleware.ts` to `proxy.ts`
- Database uses Turso/libSQL through Drizzle ORM with schema in `src/db/schema.ts`
- Auth uses Clerk with Google + Facebook only, without email/password
- Email uses Resend with templates in `src/emails/`
- Logging uses `pino` through `src/lib/logger.ts`
- Environment validation lives in `src/lib/env.ts` without Zod

## Conventions

- TypeScript strict mode, no `any`
- Use `@/` path alias for imports
- Keep new DB tables in `src/db/schema.ts`
- Keep new shared utilities in `src/lib/`
- Keep new React components in `src/components/`
- Keep unit tests in `tests/unit/` and E2E tests in `tests/e2e/`
- Run `pnpm lint` and `pnpm test` before committing

## Do NOT

- Add Zod to this project
- Add email/password authentication
- Use `console.log` or `console.error`
- Create API routes without `apiHandler`
- Bypass type safety with `any` or double-casts
