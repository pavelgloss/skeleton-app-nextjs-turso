# Findings 2 — Backport do skeleton-init skillu -- už je backportovano a je možné tento Findings 2 smazat

## DB: nikdy nemazat cizí tabulky
- Turso DB je sdílená napříč projekty. Skeleton demo tabulky (`skeletonapp_rate_limits`) patří jiným klonům.
- **Pravidlo:** Při init nové appky vytvořit nové tabulky s prefixem projektu. Staré skeleton tabulky ze schématu odebrat, ale v DB je NEMAZAT (žádný `DROP TABLE`).
- `setup-db.ts` smí jen `CREATE TABLE IF NOT EXISTS`, nikdy `DROP`.

## DB: nepoužívat `drizzle-kit push`
- V non-TTY shellu padne na interaktivní prompt (rename detection).
- Navíc `drizzle-kit push` by mohl detekovat "přejmenování" a poškodit cizí tabulky.
- **Pravidlo:** Nové tabulky vytvářet přes raw SQL script (`CREATE TABLE IF NOT EXISTS`). Bezpečnější a jednodušší.

## Env: unifikovaný přístup k env proměnným

### Problém
Existoval wrapper `src/lib/load-env-files.ts` který načítal `.env.local` i `.env` přes `process.loadEnvFile()`. Zbytečná abstrakce — skrývá co se děje, fallback na `.env` je matoucí (soubor ani neexistuje).

### Rozhodnutí
Jeden soubor `.env.local`, žádný wrapper, žádná závislost:

| Kde | Kdo načte env? | Co dělat? |
|---|---|---|
| Next.js runtime (dev/build/API routes/pages) | Next.js sám | Nic — `process.env.X` funguje |
| Standalone skripty (`scripts/*.ts`, `drizzle.config.ts`) | Nikdo — běží přes `tsx` mimo Next.js | `process.loadEnvFile(".env.local");` jako první řádek |
| `src/db/index.ts` (lazy init) | Volající (Next.js nebo skript) | Nic — env už je načtený |
| Produkce (Vercel) | Vercel env vars | Nic — žádný soubor |

### Co udělat (TODO — zatím neimplementováno)
1. Smazat `src/lib/load-env-files.ts`
2. V standalone skriptech nahradit `import { loadEnvFiles }...` za `process.loadEnvFile(".env.local");`
3. Z `src/db/index.ts` odebrat import a volání `loadEnvFiles()` — env načte buď Next.js nebo volající skript
4. Totéž v `drizzle.config.ts`

### Proč ne `dotenv`?
- Node 22 má `process.loadEnvFile()` built-in — dělá totéž, žádná závislost.
- `dotenv` defaultně čte `.env`, ne `.env.local`. Buď bychom přejmenovali soubor (breaking Next.js konvence), nebo konfigurovali `dotenv.config({ path: ".env.local" })` — zbytečná komplikace.
- Přidávat devDependency na něco co runtime umí nativně nedává smysl.

### Proč ne `dotenvx`?
- Řeší šifrování secrets — overkill, nepoužíváme.

## Build: stale `.next` cache (možná Dropbox)
- Po smazání route souboru build selhal na stale type referenci v `.next/dev/types/`. Pravděpodobně způsobil Dropbox, který synchronizuje `.next/` z předchozího dev runu a může držet soubory zamčené.
- **Pravidlo:** V kořenu Dropboxu (`~/Dropbox/rules.dropboxignore`) přidat pravidlo pro `.next` a `node_modules` — soubor je lokální per-device, nesynchronizuje se. Jako fallback před buildem smazat `rm -rf .next/dev .next/types .next/cache` (ne celý `.next` — zamčené soubory mohou blokovat).
- **Pozor:** `rules.dropboxignore` platí jen na nové soubory. Existující `.next/` se musí nejdřív smazat, pak se znovu nevytvoří v Dropboxu.

## Build: při mazání kódu projít všechny importy
- Smazání tabulky ze `schema.ts` rozbije kód který ji importuje (`rate-limit.ts`, testy).
- **Pravidlo:** Při odebírání čehokoli ze schématu/kódu grepnout všechny importy a smazat/upravit závislý kód včetně testů.

## Vercel: `env add` spouštět po jednom
- Řetězení přes `&&` se zasekne — CLI pravděpodobně drží stdin.
- **Pravidlo:** Každý `vercel env add` jako samostatný příkaz.

## Vercel: adresáře s mezerami generují nevalidní project name
- Vercel CLI odvodí název projektu z adresáře. Mezery a délka ho rozbijí.
- **Pravidlo:** Při prvním deployi použít `--scope <team>`. Nepoužívat `vercel link` — může navázat Git integraci, které se záměrně vyhýbáme. Název projektu CLI odvodí z `package.json#name`, proto ho aktualizovat před deployem.
