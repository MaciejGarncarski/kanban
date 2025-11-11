import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { Subject } from 'rxjs';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { SendToTeamMembersHandler } from 'src/notifications/application/events/handlers/send-to-team-members.handler';
import { NotificationsService } from 'src/notifications/infrastructure/services/notifications.service';
import { teamRoles } from 'src/team/domain/types/team.types';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

describe('NotificationsService', () => {
  let service: NotificationsService;
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
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should add and remove clients', () => {
    const subject = new Subject<any>();
    service.addClient('user-1', subject);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    expect((service as any).clients.has('user-1')).toBe(true);

    service.removeClient('user-1');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    expect((service as any).clients.has('user-1')).toBe(false);
  });

  it('should send to team members without errors', async () => {
    // Arrange
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const teamIdReadable = generateReadableId();

    const [newTeam] = await db
      .insert(teams)
      .values({
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: teamIdReadable,
      })
      .returning();

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: newUser.id,
      role: teamRoles.ADMIN,
    });

    await expect(
      service.sendToTeamMembers(teamIdReadable),
    ).resolves.not.toThrow();
  });
});
