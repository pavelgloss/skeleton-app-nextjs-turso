# Drizzle ORM - Query Best Practices

Stack: TypeScript, Next.js, Drizzle ORM, Turso (SQLite)

## Vždy používej Select API, ne Query API

Select API (`db.select().from()`) je výchozí a jediný povolený styl v tomto projektu.

**Proč:**

- **Čitelnost pro AI agenta** - každý dotaz je soběstačný, nepotřebuje znát `relations` definované jinde
- **Blízko SQL** - kdo umí SQL, umí číst Select API; snazší refaktory a debugging
- **Testovatelnost** - dotaz závisí jen na schématu tabulky, ne na globálním relations grafu
- **Žádný skrytý stav** - Query API vyžaduje `relations` v `drizzle()` konfiguraci, Select API ne

## Vzory

### Jednoduchý select

```ts
const user = await db
  .select()
  .from(users)
  .where(eq(users.clerkId, clerkId))
  .get(); // .get() pro jeden řádek (SQLite)
```

### Select konkrétních sloupců

```ts
const emails = await db
  .select({ email: users.email })
  .from(users)
  .where(eq(users.clerkId, clerkId));
```

### Agregace přes `sql<T>`

```ts
const [result] = await db
  .select({ count: sql<number>`count(*)` })
  .from(rateLimits)
  .where(and(eq(rateLimits.ip, ip), gt(rateLimits.createdAt, cutoff)));
```

### JOIN místo Query API relations

```ts
// Správně - explicitní JOIN
const rows = await db
  .select({
    userId: users.id,
    email: users.email,
    orderId: orders.id,
  })
  .from(users)
  .innerJoin(orders, eq(users.id, orders.userId))
  .where(eq(users.clerkId, clerkId));

// Špatně - Query API s relations
// const result = await db.query.users.findFirst({ with: { orders: true } });
```

### Insert

```ts
await db.insert(users).values({ clerkId, email });
```

### Insert s returning (pokud potřebuješ ID)

```ts
const [newUser] = await db
  .insert(users)
  .values({ clerkId, email })
  .returning();
```

### Update

```ts
await db
  .update(users)
  .set({ email: newEmail })
  .where(eq(users.clerkId, clerkId));
```

### Delete

```ts
await db.delete(rateLimits).where(lt(rateLimits.createdAt, cutoff));
```

### Surové SQL jako poslední možnost

```ts
import { sql } from "drizzle-orm";

const result = await db.run(
  sql`DELETE FROM ${rateLimits} WHERE created_at < ${cutoff}`,
);
```

## Pravidla

1. **Nepoužívej Query API** (`db.query.*`) - nedefinujeme `relations`, nepoužíváme `findFirst`/`findMany`
2. **Typuj `sql<T>` šablony** - vždy `sql<number>`, `sql<string>` atd., nikdy holé `sql`
3. **Používej `.get()` pro single row** na SQLite/Turso, destructuring `[result]` pro agregace
4. **Skládej podmínky přes `and()`/`or()`** - ne řetězení `.where().where()`
5. **Pojmenovávej sloupce v selectu** když nevracíš celý řádek: `{ count: sql<number>\`count(*)\` }`
6. **Indexy definuj v schématu** přímo u tabulky, ne zvlášť
