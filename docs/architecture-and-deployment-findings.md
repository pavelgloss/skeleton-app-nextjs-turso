# Architektura a deployment — zjištění a poučení

## 1. Vercel + GitHub integrace na Hobby plánu

Vercel se automaticky pokusí propojit projekt s GitHub repem. Na Hobby plánu pak blokuje deploy, pokud Git autor (email) není vlastníkem Vercel týmu. Chybová hláška:

> Deployment Blocked — Git author pavel.gloss@post.cz must have access to the team Pavel Gloss' projects on Vercel to create deployments. The Hobby Plan does not support collaboration for private repositories. Please upgrade to Pro to add team members.

**Pozorování:** První CLI deploy (`vercel --prod`) prošel úspěšně. Každý další deploy přes CLI byl ale Blocked — i s `--force`, i po odpojení Git integrace v dashboardu. Vercel detekuje Git metadata v uploadovaném kódu a na Hobby plánu blokuje.

**Redeploy z dashboardu** (tři tečky → Redeploy) funguje, ale vezme kód z toho konkrétního deploye — nelze tím dostat nový kód na produkci.

**Řešení:** Propojit GitHub repo s Vercel projektem (Project → Settings → Git → Connect). Pak `git push` = automatický deploy bez blokace. Viz `docs/first-deployment.md` pro kompletní postup.

Alternativy: udělat repo public, nebo upgradovat na Pro plán.

## 2. Lazy inicializace DB klienta (Turso/libSQL)

Při `next build` Next.js importuje API route moduly, aby zjistil jejich konfiguraci. Pokud se na top-level (při importu modulu) spouští kód, který sahá na runtime env proměnné (`process.env.TURSO_DATABASE_URL` apod.), build spadne — Vercel non-`NEXT_PUBLIC_` env proměnné injectuje až za běhu (runtime). Při buildu jsou `undefined`, i když jsou správně nastavené v dashboardu Vercelu. Proto eager init, který čte tyto proměnné, spadne při buildu vždy. Eager init který env proměnné nepotřebuje je v pořádku.

```
LibsqlError: URL_INVALID: The URL 'undefined' is not in a valid format
Error: Failed to collect page data for /api/health
```

**Řešení:** DB klient v `src/db/index.ts` musí používat lazy inicializaci — vytvoří se až při prvním reálném přístupu, ne při importu.

Obecnější pravidlo z tohohle incidentu: top-level kód v server modulech má být bez side effectů a bez eager inicializace závislé na runtime prostředí. Když framework při buildu nebo analýze modul importuje, může se top-level kód spustit dřív, než čekáš.

Konkrétně:

- žádné zápisy do DB na top-level
- žádné volání externích API na top-level
- žádné čtení runtime-only env proměnných na top-level, pokud build ty hodnoty nepotřebuje
- inicializaci klientů a jiný side-effectful kód dělat až uvnitř funkce, handleru, action, jobu nebo jiného explicitně volaného entrypointu

Dvě varianty implementace:

- **`getDb()` funkce** (preferovaná) — explicitní volání, konzumenti píší `getDb().select()...`. Čitelné, žádná magie, AI agent i člověk okamžitě vidí, že je to lazy.
- **Proxy pattern** — `export const db = new Proxy(...)` se tváří jako normální objekt, ale inicializuje se až při prvním přístupu. Výhoda: konzumenti nemusí měnit kód (`db.select()` funguje). Nevýhoda: implicitní chování schované za normálně vypadající proměnnou — agent nemá důvod tušit, že se za `db` skrývá lazy init.

**Pro AI agentic workflow preferuj `getDb()`** — explicitní kód je lepší než chytrý kód. Agent rozumí funkci, nerozumí Proxy magii. Pár řádků navíc v konzumentech je lepší než skrytá složitost v jednom souboru.

Stejný princip platí i uvnitř implementace lazy singletonu. Zápis `if (dbInstance === undefined) { dbInstance = createDb(); }` je pro AI agenta i člověka čitelnější než `dbInstance ??= createDb();`, protože je z něj okamžitě vidět podmínka, side effect i moment inicializace. Úspora několika znaků tady nemá hodnotu, pokud schová důležitý krok.

**Poznámka k `force-dynamic`:** Next.js má direktivu `export const dynamic = "force-dynamic"`, která říká „tuto route prerenderuj až za běhu, ne při buildu". Dá se tím obejít problém s build-time importy, ale je to obezlička — neřeší příčinu (eager init), jen symptom. Správné řešení je lazy DB init.

## 3. Node.js verze na Vercelu

Vercel může defaultně přiřadit Node.js verzi, která neodpovídá projektu (např. Node 24 místo 22). To může způsobit nekompatibility.

Aktuální Vercel umí Node.js verzi přebrat i z `package.json` přes `engines.node`. Pokud je rozsah moc široký (např. `>=22.0.0`), Vercel může vybrat vyšší podporovaný major, než chceš. To znamená, že pro vynucení Node 22 je lepší použít `22.x` nebo `^22.0.0`, ne otevřený rozsah.

**Řešení:** V `package.json` nastavit `engines.node` na `22.x` a případně stejnou major verzi potvrdit i ve Vercelu (Project → Settings → General → Node.js Version) nebo přes API:

```bash
# Přes Vercel API
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -d '{"nodeVersion":"22.x"}' \
  "https://api.vercel.com/v9/projects/$PROJECT_ID"
```

## 4. Trailing newline v env proměnných přes CLI

Při nastavování env proměnných přes `vercel env add` s bash heredoc/`<<<` se na konec hodnoty přidá newline (`\n`). URL pak vypadá jako `libsql://...turso.io%0A` a libSQL klient ji odmítne.

**Řešení:** Používat `printf` místo `<<<`:

```bash
# Špatně — přidá \n na konec
vercel env add TURSO_DATABASE_URL production <<< "libsql://..."

# Správně — bez trailing newline
printf "libsql://..." | vercel env add TURSO_DATABASE_URL production
```

## 5. Chybějící `drizzle-kit` v devDependencies

`drizzle-kit` je potřeba pro `drizzle.config.ts`, který se importuje při TypeScript type-checkingu během `next build`. Pokud chybí v devDependencies, build spadne:

```
Cannot find module 'drizzle-kit' or its corresponding type declarations
```

**Řešení:** `pnpm add -D drizzle-kit`

## 6. `devEngines` a `preinstall` check

`package.json` obsahoval `devEngines` s `"onFail": "error"` a `preinstall` script (`npx only-allow pnpm`). Na Vercelu to může způsobit problémy, pokud builder používá jinou verzi pnpm nebo jiný package manager.

**Řešení:** Pro Vercel kompatibilitu stačí mít `"packageManager": "pnpm@x.x.x"` v package.json — Vercel detekuje `pnpm-lock.yaml` a použije pnpm automaticky. Striktní `devEngines` a `preinstall` check lze odstranit.

## 7. Vercel CLI v subprocesu (Claude Code)

Vercel CLI spuštěné jako subproces (např. z Claude Code) může mít problém se streamováním build logů — deploy se uploaduje, ale CLI nedokáže sledovat build a hlásí „Unexpected error". Build na serveru přitom může proběhnout normálně.

**Řešení:** Pokud CLI v subprocesu selhává, spustit `vercel --prod` v normálním terminálu.

## 8. Uvozovky v env hodnotách při bulk importu

Při nahrávání env proměnných z `.env.local` přes skript se hodnoty v uvozovkách (např. `RESEND_FROM_EMAIL="skeleton-app <onboarding@resend.dev>"`) uloží i s uvozovkami. Vercel na to upozorní hláškou "Value includes surrounding quotes (these will be stored literally)". Hodnota pak obsahuje doslova `"..."` a služba (Resend apod.) ji odmítne.

**Řešení:** Po bulk importu zkontrolovat v dashboardu hodnoty s uvozovkami a opravit ručně, nebo v importním skriptu uvozovky stripovat.

## 9. Env proměnné — environment scope (Production vs Preview)

Vercel env proměnné se nastavují per environment: Production, Preview, Development. Pokud jsou nastavené jen pro Production, Preview deploye (např. z pull requestů) je nemají a spadnou.

**Řešení:** Při nastavování env vars přes CLI zadat všechna prostředí, nebo nastavit v dashboardu checkbox pro všechna potřebná prostředí. Příkaz `vercel env add NAME production` nastaví jen pro production — pro preview je potřeba zvlášť `vercel env add NAME preview`.
