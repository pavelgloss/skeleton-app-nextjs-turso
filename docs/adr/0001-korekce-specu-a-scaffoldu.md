# ADR 0001: Korekce specifikace a scaffoldu

## Stav

Přijato

## Kontext

Při implementaci podle `skeleton-app-spec.md` se ukázaly dvě praktické odchylky:

1. Next.js 16 při buildu vynucuje `jsx: "react-jsx"` a doplňuje `.next/dev/types/**/*.ts` do `tsconfig.json`.
2. Scaffold generovaný `create-next-app` už používá nativní flat ESLint config z `eslint-config-next`, takže varianta s `FlatCompat` by přidávala zbytečnou dependency navíc.
3. Aktuální `shadcn` CLI má `default` styl označený jako deprecated a místo něj doporučuje `new-york`.
4. `shadcn add` v aktuální CLI negeneruje kompletní inicializační scaffold (`src/lib/utils.ts`) a nedoplnil všechny přímé dependency, které vygenerované komponenty importují.

## Rozhodnutí

- V `tsconfig.json` ponecháváme hodnoty vynucené Next.js 16, protože jsou nutné pro úspěšný build.
- `eslint.config.mjs` používá současný flat config API z Next.js 16 a jen doplňuje projektové pravidlo pro nepoužité proměnné.
- `components.json` používá styl `new-york` s base color `neutral`, protože to odpovídá současné oficiální cestě pro `shadcn`.
- `src/lib/utils.ts` a dependency `class-variance-authority`, `clsx`, `tailwind-merge` doplňujeme ručně jako nutné peer/runtime části pro vygenerované komponenty.

## Důsledky

- Konfigurace se mírně liší od textu specifikace, ale odpovídá aktuálnímu chování Next.js 16.
- Není potřeba instalovat další ESLint balíček mimo to, co už scaffold poskytuje.
- UI scaffold odpovídá současnému `shadcn` CLI a zůstává kompatibilní s Tailwind CSS v4.
- Build není závislý na neúplném výstupu CLI a komponenty mají explicitně deklarované runtime závislosti.
