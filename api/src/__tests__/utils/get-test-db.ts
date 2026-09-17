import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';
import { Pool } from 'pg';
import { inject } from 'vitest';
import { resetDB } from '../../infrastructure/persistence/db/reset-db.js';

export async function getTestDb() {
  const pgConfig = inject('pgConfig');
  const database = `test_db_${nanoid(12)}`;

  const pgPool = new Pool({
    host: pgConfig.host,
    port: pgConfig.port,
    user: pgConfig.username,
    password: pgConfig.password,
    database,
    // Tests within a file run serially; keep the shared server far below
    // Postgres max_connections with ~30 files running in parallel.
    max: 3,
  });

  // Fresh database per file (drop + create + migrate + seed) — same
  // starting state as one-container-per-file, on the shared server.
  await resetDB(pgPool);

  const testDb = drizzle(pgPool);

  return {
    // Vestigial: the container is shared per Vitest run (see
    // setup/shared-postgres.ts) and stopped in global teardown. Kept so the
    // existing call sites don't change.
    pgContainer: undefined as unknown as StartedPostgreSqlContainer,
    pgPool,
    testDb,
  };
}

export async function stopTestDb(
  _pgContainer: StartedPostgreSqlContainer,
  pool: Pool,
) {
  await pool.end();
  // Shared container lifecycle is owned by globalSetup teardown.
}
