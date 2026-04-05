# První deployment na Vercel

Instrukce pro AI agenta. Platí pro kopii skeleton projektu v novém adresáři.

## Ověřený postup bez `origin`

Tohle je konfigurace, která byla ověřená v praxi:

```bash
vercel --prod --scope pavel-gloss-projects
```

Podmínky:
- v repu není lokální remote `origin`
- deploy jde přes CLI
- žádné lokální `pnpm build` předem není potřeba
- `--scope pavel-gloss-projects` je potřeba použít explicitně, protože CLI v neinteraktivním režimu nemá defaultní scope
- v agentním běhu se nespoléhej na prompt, předávej potřebné volby rovnou v příkazu
- root adresář deploye je `.` 
- Git link je v téhle konfiguraci `No`

Výsledek:
- Vercel si build udělá sám
- deploy skončí jako `Ready`
- web je dostupný v produkci
- po jednorázovém prvním deployi pak obvykle stačí už jen `vercel --prod` (bez `--scope`)

## Postup

### 1. Název projektu

Zjisti název projektu z `package.json` (pole `name`). Pokud je generický, zeptej se uživatele na nové jméno. Název se použije pro GitHub repo i Vercel projekt.

### 2. Lokální kontrola

Lokální `pnpm build` není povinný. Vercel si aplikaci postaví sám z commitnutých zdrojáků.

Pokud chceš před deployem odhalit chyby lokálně, můžeš build spustit ručně:

```bash
pnpm build
```

### 3. Příprava adresáře

Smaž lokální Vercel state:

```bash
rm -rf .vercel
```

### 4. GitHub repo

Tahle část je jen pro variantu, kdy se repo má ještě založit nebo přepojit.

Varianta A:
```bash
git remote remove origin
gh repo create <název> --private --source . --push
```

Varianta B:
```bash
git remote set-url origin <url-od-uživatele>
git push -u origin main
```

Poznámka:
- `git remote remove origin` maže jen lokální URL v `.git/config`
- originální repo na GitHubu tím nezmizí
- v ověřené konfiguraci pro deploy níže se `origin` nepoužívá

### 5. Vercel deploy

Pokud chceš stejný postup, který jsme ověřili, ujisti se, že lokální `origin` neexistuje:

```bash
git remote remove origin
```

Pak spusť produkční deploy:

```bash
vercel --prod --scope pavel-gloss-projects
```

Při vercel průvodci:
- Directory: `.` 
- Modify settings: `No`
- Connect Git: **`No`**  (Git integrace se v této konfiguraci nepoužívá)

### 6. Env proměnné

Nahraj env vars z `.env.local` do Vercelu přes `--value`, ne přes `stdin`. `--value` je důležité, protože `stdin` snadno přidá trailing newline a Vercel pak uloží hodnotu s artefaktem navíc.

```bash
Get-Content .env.local | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
  $parts = $_.Split('=', 2)
  $key = $parts[0].Trim()
  $value = $parts[1]
  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    $value = $value.Substring(1, $value.Length - 2)
  }
  vercel env add $key production --value $value --yes --force --scope pavel-gloss-projects
}
```

Po nahrání zkontroluj ve vercel dashboardu:
- `RESEND_FROM_EMAIL` nesmí mít kolem hodnoty uvozovky
- `NEXT_PUBLIC_APP_URL` nastav na produkční URL
- pokud Vercel zahlásí warning o newline, hodnota byla nejspíš nahraná přes `stdin` a je lepší ji přepsat přes `--value`

### 7. Redeploy s env vars

Po změně env proměnných udělej nový deploy:

```bash
vercel --prod --scope pavel-gloss-projects
```

### 8. Připojení GitHub repa

Pokud chceš připojit GitHub repo k existujícímu Vercel projektu přes CLI, použij:

```bash
vercel git connect https://github.com/pavelgloss/projekt-pokus-78.git --scope pavel-gloss-projects
```

Tohle je oddělené od deploye. `vercel --prod` deployne aplikaci, `vercel git connect` propojí repo s projektem.

### 9. Ověření

Otevři produkční URL a ověř, že web funguje a není `Internal Server Error`.

## Pozorování s `origin`

Tohle je samostatná kapitola s tím, co jsme viděli, ale bez dokončeného postupu.

- Když byl v repu lokální `origin` na privátní GitHub repo, Vercel se snažil napojit Git integraci.
- Na Hobby plánu to skončilo `Blocked`.
- Chybová hláška říkala, že Git author `pavel.gloss@post.cz` musí mít přístup do teamu `Pavel Gloss' projects`.
- Na Vercelu je přihlášený účet `pavel.gloss@gmail.com`. Oba emaily patří ke stejnému Google účtu, ale Vercel je zjevně vyhodnocuje jako dvě různé identity/uživatele.
- Prakticky to znamená, že Vercel porovnává konkrétní email/author identitu, ne stejný Google account jako celek.
- Pro privátní repo na Hobby plánu tato Git-linked cesta neprošla.
- Vercel deployment hláška říkala, že Hobby plan nepodporuje collaboration pro private repositories a je potřeba Pro.
- Pro funkční deploy jsme použili CLI cestu bez `origin`.

## Známé problémy

Viz `docs/architecture-and-deployment-findings.md` pro další související poznámky k Hobby plánu, env vars a Node.js verzi.
