# Backlog

> Střídám projekty. Tohle mi říká kde jsem skončil a co dělat dál.

## Rozdělaná práce

<!-- Poznámky pro "zítřejší já" - kde jsem skončil, co jsem řešil, jaké commandy,
     co nefunguje, na co navázat. Tohle NENÍ seznam tasků, je to pracovní notepad. -->

_Zatím nic._

## Tasky

<!-- Formát:
- [ ] **#1** `TODO` `B` `FEATURE` — Název tasku
  Volitelný stručný popis (1-3 řádky max)

Statusy: TODO | DONE | BLOCKED | SKIP | IDEA
Typy:    FEATURE | FIX | REFACTOR | INFRA | TEST | MANUAL | EXPLAIN | RESEARCH
Priorita: A (urgent) | B (normal) | C (nice-to-have)
-->

- [ ] **#1** `TODO` `C` `INFRA` — Vynucení pnpm místo npm
  Ověřit že `packageManager`, `devEngines` a `preinstall` script v package.json správně fungují a blokují npm/yarn.

- [x] **#2** `DONE` `B` `INFRA` — Commitnout a pushnout na GitHub jako public repo
  https://github.com/pavelgloss/skeleton-app-nextjs-turso

- [ ] **#3** `TODO` `B` `RESEARCH` — Jak funguje získávání IP adresy klienta v rate-limit service
  `x-forwarded-for` header nastavuje proxy/Vercel, ne browser. Ověřit: funguje na Vercel? Jaký je fallback? Dřív problémy s nginx reverse proxy na DO VPS (možná špatná konfigurace forwarded headerů). Musí to opravdu každý server (př. hosting ) nastavit? co když nechce? Pak to v backendu nepozname a nemuzeme trackovat??

- [x] **#4** `DONE` `B` `REFACTOR` — Sdílené typy/interfaces mezi UI a backend — best practices pro Next.js
  Typy v `src/types/api.ts`, importují se z UI i API routes.

- [ ] **#5** `TODO` `B` `MANUAL` — Projít celý kód

- [ ] **#6** `TODO` `B` `RESEARCH` — Zjistit co je v ADR (Architecture Decision Records)
  Projít `docs/adr/` a zjistit obsah, účel a jestli dává smysl je udržovat.

- [ ] **#7** `TODO` `B` `RESEARCH` — Kam dávat development rules pro AI agenta — docs/ vs /rules
  Rozhodnout jestli pravidla typu drizzle-query-guide patří do `docs/`, do `.cursor/rules/`, do CLAUDE.md, nebo jinam. Zjistit best practices pro AI-driven development.

## Archiv

<!-- Hotové a přeskočené tasky - jen číslo + název -->
