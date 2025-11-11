import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import { SendToTeamMembersHandler } from 'src/notifications/application/events/handlers/send-to-team-members.handler';
import { NotificationsService } from 'src/notifications/infrastructure/services/notifications.service';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

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
