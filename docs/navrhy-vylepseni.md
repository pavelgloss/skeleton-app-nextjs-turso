# Návrhy vylepšení skeleton-app

> Analytický dokument identifikující vylepšení skeleton-app archetypu.
> Seřazeno podle impact/effort poměru. Slouží jako podklad pro implementaci.

## Matice priorit

| # | Název | Impact | Effort | Kategorie |
|---|-------|--------|--------|-----------|
| V1 | Smazat AGENTS.md, sloučit do CLAUDE.md | vysoký | nízký | REFACTOR |
| V2 | Smazat load-env-files.ts wrapper | vysoký | nízký | REFACTOR |
| V3 | User sync: upsert místo select-then-insert | vysoký | nízký | FIX |
| V4 | Odstranit Co-Authored-By z git historie | střední | nízký | INFRA |
| V5 | Error boundary pro async failures | vysoký | střední | FEATURE |
| V6 | Rate limiting na všechny API endpointy | střední | nízký | FIX |
| V7 | drizzle-kit generate v non-TTY: skip rename detection | střední | střední | INFRA |
| V8 | Rozhodnout Server Actions vs API routes | vysoký | střední | RESEARCH |
| V9 | Smazat docs/findings2.md | nízký | nízký | CLEANUP |
| V10 | Přidat loading states / Suspense boundaries | střední | střední | FEATURE |
| V11 | Request ID v logování (trace propagation) | střední | střední | FEATURE |
| V12 | Konfigurovatelné rate limit konstanty | nízký | nízký | REFACTOR |

---

## Detaily tasků

### V1 — Smazat AGENTS.md, sloučit do CLAUDE.md
**Kategorie:** REFACTOR · **Impact:** vysoký · **Effort:** nízký

AGENTS.md je 30 řádků pravidel, která jsou podmnožinou CLAUDE.md. Navíc obsahuje zastaralé instrukce (stále odkazuje na `db:push`, i po dnešní opravě je tam zbytečná duplicita). Jeden canonical source = méně šancí na rozpory. PR checklist z AGENTS.md přesunout do CLAUDE.md jako novou sekci.

*Pokrývá BACKLOG #13.*

### V2 — Smazat load-env-files.ts wrapper
**Kategorie:** REFACTOR · **Impact:** vysoký · **Effort:** nízký

`src/lib/load-env-files.ts` je zbytečný wrapper kolem `process.loadEnvFile()`. Používá se ve 2 souborech (`src/db/index.ts`, `drizzle.config.ts`). Při skeleton-init agent občas tento wrapper kopíruje do nového kódu místo přímého volání. Smazat wrapper, v `drizzle.config.ts` nahradit za `process.loadEnvFile(".env.local")`, z `src/db/index.ts` volání odebrat úplně (env načte volající — Next.js nebo skript).

*Pokrývá BACKLOG #15.*

### V3 — User sync: upsert místo select-then-insert
**Kategorie:** FIX · **Impact:** vysoký · **Effort:** nízký

`src/lib/user-sync.ts` dělá `select where clerk_id` → `insert`. Má race condition při dvou souběžných prvních přístupech (unique constraint crash). Navíc nikdy neaktualizuje email. Řešení: nahradit za `INSERT ... ON CONFLICT (clerk_id) DO UPDATE SET email = excluded.email`. Jeden SQL dotaz, žádná race condition, email se vždy aktualizuje.

*Pokrývá BACKLOG #14 (implementační část, ne research).*

### V4 — Odstranit Co-Authored-By z git historie
**Kategorie:** INFRA · **Impact:** střední · **Effort:** nízký

Pravidlo v CLAUDE.md už existuje. Zbývá: `git filter-branch` nebo `git rebase` pro smazání trailerů z existujících commitů + force push na origin. Může ovlivnit Vercel deploy identitu (BACKLOG #11).

*Pokrývá BACKLOG #16.*

### V5 — Error boundary pro async failures
**Kategorie:** FEATURE · **Impact:** vysoký · **Effort:** střední

Skeleton nemá žádný `error.tsx` ani `global-error.tsx`. Pokud user sync spadne, dashboard renderuje unhandled rejection. Pro skeleton stačí: `src/app/error.tsx` (catch-all), `src/app/dashboard/error.tsx` (specifický pro auth flow). Zobrazit uživatelsky přívětivou chybovou stránku s "zkuste znovu".

### V6 — Rate limiting na všechny API endpointy
**Kategorie:** FIX · **Impact:** střední · **Effort:** nízký

Rate limiting je implementovaný v `src/lib/rate-limit.ts`, ale aplikovaný jen na `/api/rate-limit-demo`. Endpointy `/api/send-email` a `/api/chat` nemají žádnou ochranu. U send-email je to zvlášť rizikové — kdokoli může spam emaily. Stačí přidat `await checkRateLimit(req, "/api/send-email")` do existujících handlerů.

### V7 — drizzle-kit generate v non-TTY: skip rename detection
**Kategorie:** INFRA · **Impact:** střední · **Effort:** střední

`drizzle-kit generate` spadne v non-TTY (Claude Code) když detekuje rename tabulky. Zjistit jestli existuje flag pro skip rename promptu (např. `--no-rename`). Pokud ne, zdokumentovat workaround (smazat starý snapshot a generovat od nuly) nebo napsat issue do drizzle-kit repo.

### V8 — Rozhodnout Server Actions vs API routes
**Kategorie:** RESEARCH · **Impact:** vysoký · **Effort:** střední

Skeleton vynucuje explicitní API routes přes `apiHandler`, ale Next.js 16 preferuje Server Actions pro mutace. Pro AI agenta je důležité jasné pravidlo — buď vždy API routes, nebo vždy Server Actions, nebo jasná heuristika kdy co. Rozhodnutí ovlivní skeleton-init skill, CLAUDE.md i budoucí vývoj.

*Pokrývá BACKLOG #9.*

### V9 — Smazat docs/findings2.md
**Kategorie:** CLEANUP · **Impact:** nízký · **Effort:** nízký

Všechna pravidla z findings2 jsou backportována do CLAUDE.md a skeleton-init. TODO (env wrapper) je v backlogu jako #15. Soubor je obsoletní a matoucí pro agenty.

### V10 — Přidat loading states / Suspense boundaries
**Kategorie:** FEATURE · **Impact:** střední · **Effort:** střední

Skeleton nemá `loading.tsx` v žádné route. Dashboard závisí na async user sync a nemá loading state. Pro skeleton stačí: `src/app/loading.tsx` (global), `src/app/dashboard/loading.tsx` (pro auth check). Jednoduchý spinner nebo skeleton UI.

### V11 — Request ID v logování
**Kategorie:** FEATURE · **Impact:** střední · **Effort:** střední

`apiHandler` loguje requesty, ale bez request ID. Při debuggingu v produkci nelze korelovat logy jednoho requestu. Řešení: vygenerovat `crypto.randomUUID()` v apiHandler, předat do child loggeru (`logger.child({ requestId })`), vrátit v response headeru `x-request-id`.

### V12 — Konfigurovatelné rate limit konstanty
**Kategorie:** REFACTOR · **Impact:** nízký · **Effort:** nízký

Rate limit má hardcoded `10/min` a `100/hour` přímo v kódu. Pro skeleton by stačilo vynést do parametrů funkce `checkRateLimit(req, endpoint, { maxPerMinute: 10, maxPerHour: 100 })`, aby si agent mohl limity snadno přizpůsobit bez hledání v kódu.

---

## Doporučené pořadí implementace

**Quick wins (udělat hned, < 30 min každý):**
1. V9 — Smazat findings2.md
2. V2 — Smazat load-env-files.ts
3. V1 — Sloučit AGENTS.md do CLAUDE.md
4. V3 — User sync upsert
5. V6 — Rate limiting na všechny endpointy

**Další iterace:**
6. V5 — Error boundaries
7. V10 — Loading states
8. V12 — Konfigurovatelné rate limity
9. V4 — Co-Authored-By cleanup
10. V11 — Request ID

**Rozhodnutí (vyžaduje research/diskuzi):**
11. V8 — Server Actions vs API routes
12. V7 — drizzle-kit non-TTY workaround
