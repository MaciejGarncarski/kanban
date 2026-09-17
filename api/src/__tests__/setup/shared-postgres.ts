import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

export interface PgConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

declare module 'vitest' {
  export interface ProvidedContext {
    pgConfig: PgConfig;
  }
}

/**
 * Starts a single Postgres container shared by every spec file in this
 * Vitest run (connection info is passed to workers via provide/inject).
 * Each file still gets its own isolated database (created in getTestDb),
 * so test isolation is unchanged — we just stop paying for ~30 container
 * startups.
 */
export default async function setup({
  provide,
}: {
  provide: (key: 'pgConfig', value: PgConfig) => void;
}) {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    'postgres:18-alpine',
  ).start();

  provide('pgConfig', {
    host: container.getHost(),
    port: container.getMappedPort(5432),
    username: container.getUsername(),
    password: container.getPassword(),
  });

  return async function teardown() {
    await container.stop();
  };
}
