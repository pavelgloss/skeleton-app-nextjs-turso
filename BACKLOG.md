# Backlog

> Střídám projekty. Tohle mi říká kde jsem skončil a co dělat dál.

IN PROGRESS: jestli je dobře zdokumentováno pro ai agenty, že vždycky se projekt nějak jmenuje (ne genericky app, skeleton-app atd.) a že bude v env proměnných prefix pro databázové tabulky a žádný db skript nikdy nesahne na tabulky ve sdílené databázi , které mají jiný prefix (protože v nich jsou data k jiným aplikacím/projektům)

proč vůbec existuje migrate.ts skript, není na to standardní npm drizzle "migrate" command? proč vymýšlíme kolo????

migrační skripty se musí pojmenovávat sémanticky , ne náhodná slova


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

- [ ] **#8** `IDEA` `B` `RESEARCH` — Vymyslet lepší název pro skeleton appku
  "skeleton" je moc technický. Zvážit "agentic app" nebo jiný název, který lépe vystihne účel archetypu/skeletonu.

- [ ] **#9** `IDEA` `B` `RESEARCH` — jestli vynucovat Server Actions nebo raději explicitně API endpointy (routes), z hlediska rychlosti vývoje, readability a maintenance v rámci AI Agentic Flow
  Server Actions - jde o mechanismus pro typově bezpečné RPC (Remote Procedure Call), který automaticky vytvoří API endpoint pro serverovou funkci a umožní ti ji volat z klienta jako běžnou asynchronní metodu

- [ ] **#10** `TODO` `B` `INFRA` — Smazat node_modules a nastavit pnpm store na user level
  Zajistit že pnpm ukládá dependencies do globálního store (user level), ne do project level.

- [ ] **#11** `TODO` `AA` `MANUAL` — Ověřit jestli Vercelu vadí Claude Code jako contributor v privátním repu
  Prověřit jestli `Co-Authored-By` nebo commity se dvěma user identitami můžou na Vercelu spouštět stejný `Blocked` problém jako odlišný Git author.
  tj. do nového repa, bez historie commitů, udělám git init a jeden commit jako uživatel X versus logged user na vercelu jestli bude stále  problém

- [ ] **#12** `TODO` `AA` `MANUAL` — Ručně zkusit nalinkovat Vercel a Git a ověřit identitu uživatele
  Ověřit jestli si Vercel při ručním Git linku pořád myslí, že Git user je jiný než přihlášený Vercel user, a jestli to znovu končí `Blocked`.

- [ ] **#13** `TODO` `B` `REFACTOR` — Zkonsolidovat `AGENTS.md` a `CLAUDE.md`
  Rozhodnout co má být canonical source pro agent instrukce, odstranit duplicity a srovnat případné rozpory mezi oběma soubory.

- [ ] **#15** `TODO` `B` `REFACTOR` — Smazat env wrapper `load-env-files.ts` a sjednotit načítání env
  1. Smazat `src/lib/load-env-files.ts`
  2. Ve standalone skriptech nahradit `import { loadEnvFiles }...` za `process.loadEnvFile(".env.local");`
  3. Z `src/db/index.ts` odebrat import a volání `loadEnvFiles()` — env načte buď Next.js nebo volající skript
  4. Totéž v `drizzle.config.ts`

- [ ] **#14** `TODO` `B` `RESEARCH` — Prověřit spolehlivost syncu Clerk user → DB
  Dnes se sync dělá jen on-demand při vstupu na `/dashboard`: `src/proxy.ts` route chrání, `src/app/dashboard/page.tsx` zavolá `currentUser()`, a pokud user existuje, `src/lib/user-sync.ts` udělá `select where clerk_id = ...` a při nenalezení vloží nový řádek do `users`.
  Prakticky to znamená:
  - sync se nedělá při sign-up webhooku
  - sync se nedělá při login callbacku
  - sync se nedělá v middleware
  - sync se dělá až když přihlášený user otevře `/dashboard`
  Ukládá se jen `clerk_id`, `email`, `created_at` a `id`.
  Rizika současného řešení:
  - user, který nikdy neotevře `/dashboard`, se do DB nikdy nezapíše
  - změna emailu v Clerk se nikdy nepropíše, protože sync řeší jen insert
  - smazání usera v Clerk se nikdy nepropíše, protože není delete sync
  - při dvou současných prvních vstupech může vzniknout race condition `select -> insert` a jedna větev může spadnout na unique constraint `clerk_id`
  - když sync selže, může spadnout i render dashboardu, protože `await syncUser(user)` není obalený recovery logikou
  Navrhnout nejjednodušší robustnější variantu pro skeleton:
  - bezpečnější upsert místo `select-then-insert`
  - update emailu při každém vstupu na dashboard
  - případně rozhodnout, jestli má skeleton zůstat jen jako demo `best effort sync`, nebo jestli má přidat webhook-based synchronizaci



## Archiv

<!-- Hotové a přeskočené tasky - jen číslo + název -->
