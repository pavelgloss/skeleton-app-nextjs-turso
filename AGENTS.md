# AGENTS.md - Pravidla workflow pro agenty

## Postup práce

1. Nejdřív si přečti `CLAUDE.md`.
2. Před větší změnou si ověř aktuální stav přes `pnpm build`, pokud je to rozumné.
3. Po změnách spusť `pnpm lint` a `pnpm test`.
4. Pokud přidáváš novou API route, použij `apiHandler`.
5. Pokud měníš DB tabulky, uprav `src/db/schema.ts` a spusť `pnpm db:push`.

## Pravidla pro soubory

- Nové stránky patří do `src/app/`
- Nové API route patří do `src/app/api/{name}/route.ts`
- Ochrana route patří do `src/proxy.ts`
- Sdílené utility patří do `src/lib/`
- React komponenty patří do `src/components/`
- Email šablony patří do `src/emails/`
- Testy patří do `tests/unit/` nebo `tests/e2e/`

## PR checklist

- [ ] `pnpm lint` prochází
- [ ] `pnpm format:check` prochází
- [ ] `pnpm test` prochází
- [ ] `pnpm build` prochází
- [ ] Nejsou přidané nové logy přes `console`
- [ ] Nejsou přidané `any` typy
- [ ] API route používají `apiHandler`
