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

- [ ] **#2** `TODO` `B` `INFRA` — Commitnout a pushnout na GitHub jako public repo
  Repo `skeleton-app-nextjs-turso` pod účtem `pavelgloss`. Před pushnutím zkontrolovat že v kódu nejsou API keys, tokeny ani jiná citlivá data.

- [ ] **#3** `TODO` `B` `RESEARCH` — Jak funguje získávání IP adresy klienta v rate-limit service
  `x-forwarded-for` header nastavuje proxy/Vercel, ne browser. Ověřit: funguje na Vercel? Jaký je fallback? Dřív problémy s nginx reverse proxy na DO VPS (možná špatná konfigurace forwarded headerů). Musí to opravdu každý server (př. hosting ) nastavit? co když nechce? Pak to v backendu nepozname a nemuzeme trackovat??

- [ ] **#4** `TODO` `B` `REFACTOR` — Sdílené typy/interfaces mezi UI a backend — best practices pro Next.js
  Zkontrolovat stávající stav, nastavit strukturu pro sdílení typů (ne Java-style "shared" modul, ale Next.js konvence). Vytvořit example a popsat v README.

## Archiv

<!-- Hotové a přeskočené tasky - jen číslo + název -->
