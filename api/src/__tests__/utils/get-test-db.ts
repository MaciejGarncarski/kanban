import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { resetDB } from 'src/infrastructure/persistence/db/reset-db';

export async function getTestDb() {
  const pgContainer = await new PostgreSqlContainer('postgres:18-alpine')
    .withDatabase('kanban')
    .withReuse()
    .start();

  const pgPool = new Pool({
    host: 'localhost',
    port: pgContainer.getMappedPort(5432),
    user: pgContainer.getUsername(),
    password: pgContainer.getPassword(),
    database: pgContainer.getDatabase(),
  });

  await resetDB(pgPool);

  const testDb = drizzle(pgPool);

  return { pgContainer, pgPool, testDb };
}

export async function stopTestDb(
  pgContainer: StartedPostgreSqlContainer,
  pool: Pool,
) {
  await pool.end();
  await pgContainer.stop();
}
