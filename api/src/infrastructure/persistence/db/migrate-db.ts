import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client, Pool } from 'pg';

type MigrateDBParams =
  | {
      pool?: Pool;
      dbClient?: never;
    }
  | {
      pool?: never;
      dbClient?: Client;
    };

export async function migrateDB({ pool, dbClient }: MigrateDBParams) {
  if (pool) {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: 'drizzle' });
    return;
  }
  if (dbClient) {
    const db = drizzle(dbClient);
    await migrate(db, { migrationsFolder: 'drizzle' });

    return;
  }

  throw new Error('Either pool or dbClient must be provided');
}
