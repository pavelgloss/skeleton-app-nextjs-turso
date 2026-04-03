# skeleton-app

Hotový starter pro SaaS appky. Optimalizovaný pro workflow s AI coding agenty.

## Proč

Stavět SaaS od nuly znamená dny zapojování auth, databáze, emailu, API rout, testů a CI — ještě než napíšeš řádek business logiky. Tenhle skeleton to řeší za tebe. Clonuj repo, doplň env proměnné, deployni na Vercel a řeš business logiku — ne boilerplate.

**AI-first workflow.** Projekt obsahuje `CLAUDE.md` s architekturou, konvencemi a pravidly, které AI coding agent dostane do kontextu. Databázové dotazy (Drizzle ORM) používají self-contained Select API bez skrytých závislostí na relations grafu. Agent tak rozumí struktuře kódu a píše konzistentní kód hned od prvního promptu. Ty plníš backlog, agent kóduje.

**Roste s tebou.** Všechny služby ve stacku (Vercel, Turso, Clerk, Resend) startují zdarma, ale škálují až na ~5 000 uživatelů bez migrace. Když PoC chytne, nic nepřepisuješ — prostě pokračuješ.

**Proč Turso a ne Supabase?** Supabase na free tieru dává jen 500 MB a po období nečinnosti suspenduje projekt. Když vyvíjíš PoC a týden nekóduješ, vrátíš se k mrtvé databázi. Turso má 5 GB na free tieru a nic nesuspenduje.

**Technologický stack:** Next.js 16 · Clerk (auth) · Turso (cloud databáze) + Drizzle · OpenAI · Resend · Vitest + Playwright · pnpm

## Požadavky

- Node.js 22
- `pnpm`
- Turso CLI
- Clerk účet
- OpenAI API key
- Resend API key
- Ověřená Resend doména, pokud chceš posílat mimo sandbox

## Rychlý start

1. Nainstaluj závislosti:

   ```bash
   pnpm install
   ```

   Projekt záměrně vynucuje `pnpm`; `npm install` a `npm run ...` skončí chybou.

2. Zkopíruj `.env.local.example` na `.env.local` a doplň reálné hodnoty.
   Pro doručování na cizí adresy nastav `RESEND_FROM_EMAIL` na adresu z ověřené domény v Resend.

   **Kde získat API klíče:**

   | Služba | Odkaz |
   |--------|-------|
   | Clerk  | https://dashboard.clerk.com → tvá aplikace → **API Keys** |
   | Resend | https://resend.com/api-keys |
   | OpenAI | https://platform.openai.com/api-keys |
   | Turso  | Přes CLI — viz níže |

   **Turso databáze přes CLI (na Windows použij WSL):**

   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash   # instalace CLI (uvnitř WSL)
   turso auth login                                    # přihlášení
   turso db create skeleton-app                        # vytvoření DB
   turso db show skeleton-app --url                    # → TURSO_DATABASE_URL
   turso db tokens create skeleton-app                 # → TURSO_AUTH_TOKEN
   ```

3. Nahraj schéma do databáze:

   ```bash
   pnpm db:push
   ```

4. Spusť vývojový server:

   ```bash
   pnpm dev
   ```

5. Otevři `http://localhost:3000`.

## Skeleton Init — z šablony na funkční appku

Projekt obsahuje Claude Code skill `/skeleton-init`, který přemění skeleton na reálnou web appku. Stačí popsat co chceš postavit a agent se postará o zbytek.

V Claude Code spusť:

```
/skeleton-init Chci osobní web pro freelancera se sběrem emailů na školení
```

Nebo jen `/skeleton-init` — agent se zeptá co chceš.

**Co udělá:**
- Zeptá se na 2-3 upřesňující otázky (jen pokud potřeba)
- Naplánuje MVP a rovnou implementuje — stránky, DB schéma, API, integrace
- Ověří build (`pnpm lint` + `pnpm build`)
- Commitne do main
- Deployne na Vercel

Výsledek je funkční appka s reálnými integracemi (auth, databáze, email), ne prototyp.

## Skripty

| Skript              | Popis                              |
| ------------------- | ---------------------------------- |
| `pnpm dev`          | Vývojový server s Turbopackem      |
| `pnpm build`        | Produkční build                    |
| `pnpm start`        | Spuštění produkčního buildu        |
| `pnpm lint`         | ESLint                             |
| `pnpm format`       | Prettier zápis                     |
| `pnpm format:check` | Kontrola formátování               |
| `pnpm test`         | Vitest unit testy                  |
| `pnpm test:watch`   | Vitest v watch režimu              |
| `pnpm test:e2e`     | Playwright E2E testy               |
| `pnpm db:migrate`   | Spuštění SQL migrací z `drizzle/`  |
| `pnpm db:push`      | Push aktuálního schématu do DB     |
| `pnpm db:studio`    | Otevření Drizzle Studia            |
| `pnpm smoke`        | Rychlá kontrola hlavních endpointů |

## Clerk nastavení

1. V Clerk dashboardu vytvoř aplikaci.
2. V části Social connections zapni pouze Google a Facebook.
3. Vypni Email + Password i další lokální metody přihlášení.
4. Nastav redirect URL:
   `/sign-in`, `/sign-up`, `/dashboard`
5. Zkopíruj API klíče do `.env.local`.

## Deploy na Vercel

1. Přihlas se do Vercelu:

   ```bash
   vercel login
   ```

2. Přidej produkční env proměnné ve Vercelu nebo přes CLI.

3. Nasaď projekt:

   ```bash
   vercel
   ```

4. Po deployi ověř aplikaci:

   ```bash
   pnpm smoke
   ```

## Struktura projektu

- `src/app/` obsahuje App Router stránky a API routes.
- `src/proxy.ts` chrání dashboard a další routy přes Clerk.
- `src/db/` obsahuje Drizzle schéma, klienta a migrace runner.
- `src/emails/` drží React Email šablony.
- `src/types/api.ts` sdílené request/response typy pro API routes (importují UI i backend).
- `src/lib/` obsahuje sdílené utility, logger, env vrstvu a helpery.
- `tests/unit/` obsahuje Vitest testy.
- `tests/e2e/` obsahuje Playwright scénáře.
