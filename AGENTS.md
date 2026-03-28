# AGENTS.md - Agent Workflow Rules

## Task Execution

1. Read `CLAUDE.md` first for project context.
2. Before making changes, run `pnpm build` to verify current state when feasible.
3. After changes, run `pnpm lint` and `pnpm test`.
4. If adding a new API route, use `apiHandler`.
5. If adding or changing DB tables, update `src/db/schema.ts` and run `pnpm db:push`.

## File Creation Rules

- New pages go in `src/app/`
- New API routes go in `src/app/api/{name}/route.ts`
- Route protection belongs in `src/proxy.ts`
- New shared utilities go in `src/lib/`
- New React components go in `src/components/`
- New email templates go in `src/emails/`
- New tests go in `tests/unit/` or `tests/e2e/`

## PR Checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] No new `console.log` or `console.error`
- [ ] No `any` types
- [ ] API routes use `apiHandler`
