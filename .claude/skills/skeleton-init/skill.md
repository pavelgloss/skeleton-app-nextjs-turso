---
name: skeleton-init
description: "Přemění skeleton-app na reálnou web appku podle popisu uživatele. Zeptá se co chce, naimplementuje funkční MVP, commitne a deployne na Vercel."
argument-hint: "[popis appky]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion
---

# skeleton-init

Přeměníš skeleton-app na reálnou web appku. Uživatel popíše co chce, ty to naimplementuješ jako funkční MVP, commitneš do main a deployneš na Vercel.

## Kontext projektu

Skeleton-app je Next.js 16 starter s tímto stackem:
- **Auth:** Clerk (Google + Facebook only)
- **DB:** Turso (SQLite) + Drizzle ORM (Select API only, viz `docs/drizzle-query-guide.md`)
- **AI:** OpenAI via Vercel AI SDK (`@ai-sdk/openai`)
- **Email:** Resend + React Email šablony
- **UI:** Tailwind CSS 4 + Radix UI + shadcn-style components (button, card, input, textarea)
- **Testy:** Vitest (unit) + Playwright (e2e)
- **Pravidla:** `CLAUDE.md` v kořenu — přečti ho a **dodržuj**

Klíčové soubory:
- `src/app/` — App Router stránky a API routes
- `src/db/schema.ts` — Drizzle schéma (tabulky users, rateLimits)
- `src/lib/api-handler.ts` — wrapper pro API routes (vždy používej)
- `src/lib/env.ts` — env proměnné (bez Zod)
- `src/proxy.ts` — route protection (Clerk middleware)
- `src/components/ui/` — base UI components
- `src/emails/` — React Email šablony

## Postup

### 1. Zjisti co uživatel chce

Pokud uživatel zadal popis jako argument (`$ARGUMENTS`), použij ho. Pokud ne, zeptej se.

Zeptej se max **2-3 doplňujících otázek** — jen to nejdůležitější:
- Co je hlavní funkce appky? (pokud není jasné z popisu)
- Kdo je cílový uživatel? (pokud to ovlivní design)
- Nějaká specifická data která potřebuje ukládat?

**Neptej se na:** barvy, fonty, technické detaily stacku (ten je daný), deployment, auth flow.

### 2. Naplánuj MVP

Rozhodni co bude v první iteraci. Pravidla:
- **Málo funkcí, ale fungujících.** Formulář musí ukládat do DB, API musí vracet data, integrace musí fungovat.
- **Používej stávající stack.** Clerk auth, Turso DB, Resend emaily, OpenAI — nepřidávej nové závislosti pokud to není nutné.
- **Common sense při mazání.** Smaž skeleton demo kód (email form, rate limit demo) který uživatel nepotřebuje. Ale nech věci které by mohl potřebovat (auth, DB setup, API handler, logger).

Stručně uživateli napiš co budeš implementovat (5-10 bodů max). Neptej se na potvrzení — rovnou implementuj.

### 3. Implementuj

Přečti `CLAUDE.md` a dodržuj všechny konvence.

Typicky budeš:
1. Upravit DB schéma v `src/db/schema.ts` (přidat tabulky pro appku)
2. Vytvořit/upravit stránky v `src/app/`
3. Vytvořit API routes v `src/app/api/` (vždy přes `apiHandler`)
4. Upravit `src/proxy.ts` pokud potřebuješ chránit nové routes
5. Upravit `src/app/layout.tsx` (metadata, navigace)
6. Přidat komponenty do `src/components/`
7. Přidat email šablony do `src/emails/` pokud potřeba
8. Upravit `src/app/page.tsx` — hlavní landing page

DB dotazy piš **výhradně Select API** stylem podle `docs/drizzle-query-guide.md`.

### 4. Ověř že to funguje

```bash
pnpm lint
pnpm build
```

Obojí musí projít. Pokud ne, oprav chyby.

### 5. Aktualizuj projektové soubory

- `CLAUDE.md` — aktualizuj popis projektu a architektura pokud se výrazně změnila
- `README.md` — aktualizuj název, popis a specifika appky
- `package.json` — aktualizuj `name` a `description`
- `src/app/layout.tsx` — aktualizuj `metadata` (title, description)

### 6. Commitni

```bash
git add -A
git commit -m "feat: initialize [název appky] from skeleton

[stručný popis co appka dělá a jaké funkce má]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### 7. Deployni na Vercel

Nejdřív zkontroluj jestli je projekt linknutý:
```bash
vercel inspect 2>&1 | head -5
```

Pokud ne, nalinkuj (s `--yes` pro non-interactive):
```bash
vercel link --yes
```

Pak deployni:
```bash
vercel --prod
```

Pokud deploy selže kvůli env proměnným, řekni uživateli jaké proměnné musí nastavit ve Vercelu a nabídni retry.

### 8. Zapiš výsledek

Na konci uživateli napiš:
- URL deploynuté appky
- Co bylo implementováno (stručný seznam)
- Co chybí / co by šlo přidat v další iteraci
- Jaké env proměnné potřebuje nastavit (pokud nějaké chybí)

## Důležitá pravidla

- **Nikdy nepřidávej Zod** — validace je manuální (viz CLAUDE.md)
- **Nikdy nepoužívej `console.*`** — vždy `logger` z `@/lib/logger`
- **Nikdy nevytvářej API route bez `apiHandler`**
- **DB dotazy jen Select API** — žádné `db.query.*`, žádné `relations`
- **Nepoužívej `any`** — TypeScript strict mode
- **Import alias `@/`** — vždy
- **Piš česky** když komunikuješ s uživatelem
