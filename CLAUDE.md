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
- `pnpm db:generate` - vygeneruje SQL migraci z `schema.ts` do `drizzle/`
- `pnpm db:migrate` - aplikuje migrace do Turso DB
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
- Nové stránky patří do `src/app/`
- Nové API route patří do `src/app/api/{name}/route.ts` (vždy přes `apiHandler`)
- Nové DB tabulky přidávej do `src/db/schema.ts`
- Sdílené API request/response typy dávej do `src/types/api.ts` a importuj z obou stran (UI i API routes)
- Nové sdílené utility dávej do `src/lib/`
- Nové React komponenty dávej do `src/components/`
- Email šablony patří do `src/emails/`
- Unit testy patří do `tests/unit/`, E2E do `tests/e2e/`
- Před větší změnou ověř stav přes `pnpm build`, po změnách spusť `pnpm lint` a `pnpm test`
- Preferuj explicitní control flow a pojmenované mezikroky před zkrácenými operátory nebo "chytrým" zápisem, pokud je explicitní varianta čitelnější
- Zvlášť u lazy init, singletonů, fallbacků a kódu se side effectem preferuj zápis, ze kterého je na první pohled vidět podmínka, pořadí kroků a okamžik inicializace (např. explicitní `if` místo `??=`)
- Top-level kód v server modulech musí být bez side effectů a bez eager inicializace závislé na runtime prostředí
- Na top-level v server modulech nedělej zápisy do DB, nevolej externí API a nečti runtime-only env proměnné, pokud build ty hodnoty nepotřebuje
- Inicializaci klientů a jiný side-effectful kód dělej až uvnitř funkce, handleru, action, jobu nebo jiného explicitně volaného entrypointu

## Databázové dotazy

- Pravidla pro Drizzle ORM dotazy jsou v [`docs/drizzle-query-guide.md`](docs/drizzle-query-guide.md)

## Databáze — schéma a migrace

### DB mód a prefix tabulek

Projekt podporuje dva módy práce s databází:

| Mód | Kdy použít | Prefix tabulek | Příklad |
|---|---|---|---|
| **Sdílená DB** (default) | Více projektů v jedné DB (Supabase free, sdílený Turso) | `{projekt}_` | `skeletonapp_users` |
| **Dedikovaná DB** | Každý projekt má vlastní DB (Turso free má neomezené DB) | žádný | `users` |

**Aktuální mód: sdílená DB, prefix `skeletonapp_`**

V sdíleném módu:
- Všechny tabulky musí mít prefix `skeletonapp_` (nebo prefix konkrétního projektu po skeleton-init)
- Nikdy nesahej na tabulky s cizím prefixem — obsahují produkční data jiných projektů
- Při odebrání tabulky ze `schema.ts` ji v DB nech (žádný `DROP TABLE`)

V dedikovaném módu:
- Tabulky nemají prefix
- Pravidla o cizích tabulkách neplatí (v DB jsou jen tvoje)
- `DROP TABLE` je povolený (ale stále opatrně)

Při přepnutí módu: uprav názvy tabulek v `schema.ts`, přegeneruj migrace, přejmenuj/vytvoř tabulky v DB.

### Flow pro změny schématu

1. Uprav `src/db/schema.ts`
2. `pnpm db:generate --name <popis>` — vygeneruje SQL migraci do `drizzle/` (např. `--name add-posts-table`)
3. **Zkontroluj vygenerovaný SQL** — u sdílené DB ověř že migrace neobsahuje `DROP TABLE` (drizzle-kit ji může vygenerovat při odebrání tabulky ze schématu)
4. `pnpm db:migrate` — aplikuje migraci do DB

**Pojmenování migrací:** Vždy používej `--name` s popisným názvem (kebab-case). Bez `--name` drizzle-kit generuje náhodná slova (např. `mute_ender_wiggin`), která nic neříkají o obsahu migrace.

**Pravidla:**
- **Nepoužívej `drizzle-kit push`** — v non-TTY shellu padne na interaktivní prompt (rename detection) a může poškodit cizí tabulky.
- **Nikdy nespouštěj migraci s `DROP TABLE`** v sdíleném módu — tabulku odeber ze `schema.ts`, ale v DB ji nech. Pokud drizzle-kit vygeneruje DROP, ručně ho z migračního souboru smaž.

## Env proměnné — kdo je načítá

| Kde | Kdo načte env? | Co dělat? |
|---|---|---|
| Next.js runtime (dev/build/API routes/pages) | Next.js sám | Nic — `process.env.X` funguje |
| Standalone skripty (`scripts/*.ts`, `drizzle.config.ts`) | Nikdo — běží přes `tsx` mimo Next.js | `process.loadEnvFile(".env.local");` jako první řádek |
| `src/db/index.ts` (lazy init) | Volající (Next.js nebo skript) | Nic — env už je načtený |
| Produkce (Vercel) | Vercel env vars | Nic — žádný soubor |

Nepoužívej `dotenv` — Node 22 má `process.loadEnvFile()` built-in. Jeden soubor `.env.local`, žádný wrapper.

## Build — známé problémy

- **Stale `.next` cache (Dropbox):** Dropbox synchronizuje `.next/` z předchozího dev runu a může držet soubory zamčené. Před buildem případně smazat `rm -rf .next/dev .next/types .next/cache`. V `~/Dropbox/rules.dropboxignore` přidat pravidlo pro `.next` a `node_modules`.
- **Mazání kódu → projít importy:** Při odebírání čehokoli ze schématu nebo sdíleného kódu grepni všechny importy a smaž/uprav závislý kód včetně testů.

## Nedělej

- Nepoužívej `npm` — vždy `pnpm` (projekt má `packageManager` + `preinstall` guard)
- Nepřidávej Zod
- Nepřidávej email/password autentizaci
- Nepoužívej logování přes `console`
- Nevytvářej API route bez `apiHandler`
- Neobcházej typovou bezpečnost přes `any` nebo dvojité casty
- Nepoužívej `drizzle-kit push` — viz sekce „Databáze — bezpečnost sdílené DB"
- Nepoužívej `DROP TABLE` v žádném skriptu ani migraci
- **Nepřidávej `Co-Authored-By` trailer do commit messages** — žádný co-author, žádný podpis AI agenta, commit message obsahuje jen samotnou zprávu

## Checklist před PR / pushem

- [ ] `pnpm lint` prochází
- [ ] `pnpm format:check` prochází
- [ ] `pnpm test` prochází
- [ ] `pnpm build` prochází
- [ ] Nejsou přidané logy přes `console`
- [ ] Nejsou přidané `any` typy
- [ ] API route používají `apiHandler`
