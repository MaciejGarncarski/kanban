import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  getTestDb,
  stopTestDb,
} from '../../../../__tests__/utils/get-test-db.js';
import { DB } from '../../../../infrastructure/persistence/db/client.js';
import { TeamRepository } from '../team.repository.js';

describe('TeamRepository', () => {
  let repo: TeamRepository;
  let db: DB;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;

  beforeAll(async () => {
    const { pgContainer, pgPool } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = drizzle(pgPool);
    repo = new TeamRepository(db);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  describe('delete team', () => {
    it("should return null if team doesn't exist", async () => {
      const teams = await repo.deleteTeam('non-existing-id');
      expect(teams).toBe(null);
    });
  });
});
