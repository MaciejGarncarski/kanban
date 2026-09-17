import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import { SendToTeamMembersHandler } from '../send-to-team-members.handler.js';
import { NotificationsService } from '../../../../infrastructure/services/notifications.service.js';
import { TeamRepository } from '../../../../../team/infrastructure/persistence/team.repository.js';

describe('SendToTeamMembersHandler', () => {
  let handler: SendToTeamMembersHandler;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let teamRepository: TeamRepository;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;
    teamRepository = new TeamRepository(testDb);
    db = testDb;
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule, CqrsModule],
      providers: [
        SendToTeamMembersHandler,
        NotificationsService,
        { provide: DB_PROVIDER, useValue: db },
        { provide: TeamRepository, useValue: teamRepository },
        createJWTService(),
      ],
    }).compile();

    await module.init();
    teamRepository = module.get<TeamRepository>(TeamRepository);

    handler = module.get<SendToTeamMembersHandler>(SendToTeamMembersHandler);
  });

  it('should not throw any error', async () => {
    await expect(
      handler.handle({ readableTeamId: 'team-123' }),
    ).resolves.not.toThrow();
  });
});
