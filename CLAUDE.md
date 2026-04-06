# CLAUDE.md - Pokyny pro AI agenta

## Projekt

skeleton-app - Next.js 16 skeleton s Clerk auth, Turso DB, OpenAI a Resend.

## Příkazy

- `pnpm dev` - spustí vývojový server s Turbopackem
- `pnpm build` - produkční build
- `pnpm lint` - ESLint
- `pnpm format` - Prettier zápis
- `pnpm test` - Vitest unit testy
- `pnpm test:e2e` - Playwright E2E testy
- `pnpm db:push` - push schématu do DB
- `pnpm db:migrate` - spuštění migrací
- `pnpm smoke` - rychlá kontrola po deployi

## Architektura

- App Router je v `src/app/`
- API route jsou v `src/app/api/` a mají používat `apiHandler` z `src/lib/api-handler.ts`
- Ochrana route je v `src/proxy.ts`, protože Next.js 16 přejmenoval `middleware.ts` na `proxy.ts`
- Databáze používá Turso/libSQL přes Drizzle ORM, schéma je v `src/db/schema.ts`
- Auth používá Clerk s Google + Facebook only, bez email/password
- Email používá Resend a šablony v `src/emails/`
- Logování používá `pino` přes `src/lib/logger.ts`
- Validace env proměnných je v `src/lib/env.ts` bez Zodu

## Konvence

- TypeScript strict mode, žádné `any`
- Používej import alias `@/`
- Nové DB tabulky přidávej do `src/db/schema.ts`
- Sdílené API request/response typy dávej do `src/types/api.ts` a importuj z obou stran (UI i API routes)
- Nové sdílené utility dávej do `src/lib/`
- Nové React komponenty dávej do `src/components/`
- Unit testy patří do `tests/unit/`, E2E do `tests/e2e/`
- Před commitem spusť `pnpm lint` a `pnpm test`
- Preferuj explicitní control flow a pojmenované mezikroky před zkrácenými operátory nebo "chytrým" zápisem, pokud je explicitní varianta čitelnější
- Zvlášť u lazy init, singletonů, fallbacků a kódu se side effectem preferuj zápis, ze kterého je na první pohled vidět podmínka, pořadí kroků a okamžik inicializace (např. explicitní `if` místo `??=`)

## Databázové dotazy

- Pravidla pro Drizzle ORM dotazy jsou v [`docs/drizzle-query-guide.md`](docs/drizzle-query-guide.md)

## Nedělej

- Nepřidávej Zod
- Nepřidávej email/password autentizaci
- Nepoužívej logování přes `console`
- Nevytvářej API route bez `apiHandler`
- Neobcházej typovou bezpečnost přes `any` nebo dvojité casty
