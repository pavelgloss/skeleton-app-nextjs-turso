# Instrukce pro AI agenta

Naimplementuj projekt podle `skeleton-app-spec.md`. Postupuj po tascích (TASK 1 → TASK N), po každém tasku:

1. Ověř acceptance criteria daného tasku
2. Spusť `pnpm lint && pnpm build` (jakmile je to možné)
3. Commituj s message `task-XX: brief description`

## Pravidla

- **Neptej se na nic** — spec obsahuje vše potřebné. Pokud narazíš na nejednoznačnost, rozhodni sám a zdokumentuj rozhodnutí do ADR souboru (`docs/adr/XXXX-nazev.md`).
- **Piš česky ADR nebo jiné dokumenty** — pokud jsou potřeba
- **Git** — repozitář existuje, commituj po každém tasku.
- **env.local existuje** a obsahuje vše co "env.example" ale s reálnými klíči a nastavením
- **Opravit spec** — pokud je v spec chyba (např. deprecated API, špatný import), oprav v kódu a zapiš do ADR proč.
- **Neinstaluj nic navíc** — jen to co je ve spec. Pokud je něco nezbytné (např. peer dependency), zapiš do ADR.
- **Po posledním tasku** projdi finální checklist na konci spec a ověř všechny body.
