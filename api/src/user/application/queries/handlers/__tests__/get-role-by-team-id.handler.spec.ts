import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
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
import {
  team_members,
  teams,
  users,
} from '../../../../../infrastructure/persistence/db/schema.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { teamRoles } from '../../../../../team/domain/types/team.types.js';
import { GetRoleByTeamIdQuery } from '../../get-role-by-team-id.query.js';
import { GetRoleByTeamIdHandler } from '../get-role-by-team-id.handler.js';
import { UserRepositoryInterface } from '../../../../domain/ports/user.interface.js';
import { UserRepository } from '../../../../infrastructure/persistence/user.repository.js';
import { v7 } from 'uuid';

describe('GetRoleByTeamIdHandler', () => {
  let handler: GetRoleByTeamIdHandler;
  let userRepo: UserRepositoryInterface;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        GetRoleByTeamIdHandler,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetRoleByTeamIdHandler>(GetRoleByTeamIdHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should throw unauthorized exception if user is not in team', async () => {
    const query = new GetRoleByTeamIdQuery(generateReadableId(), v7());

    await expect(handler.execute(query)).rejects.toThrow(
      'User is not authorized to access this team',
    );
  });

  it('should return user role in team', async () => {
    const teamIdReadable = generateReadableId();
    const [user] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        password_hash: await hash(faker.internet.password()),
        name: faker.person.firstName(),
      })
      .returning();

    const teamId = v7();
    const role = teamRoles.ADMIN;

    const [team] = await db
      .insert(teams)
      .values({
        id: teamId,
        name: generateReadableId(),
        readable_id: teamIdReadable,
      })
      .returning();

    await db.insert(team_members).values({
      team_id: team.id,
      user_id: user.id,
      role: role,
    });

    const query = new GetRoleByTeamIdQuery(teamIdReadable, user.id);
    const result = await handler.execute(query);

    expect(result).toBe(role);
  });
});
