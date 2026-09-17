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
import { team_members } from '../../../../../infrastructure/persistence/db/schema.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { DeleteTeamCommand } from '../../delete-team.command.js';
import { DeleteTeamHandler } from '../delete-team.handler.js';
import { teamRoles } from '../../../../domain/types/team.types.js';
import { TeamRepository } from '../../../../infrastructure/persistence/team.repository.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';
import { v7 } from 'uuid';

describe('DeleteTeamHandler Integration Tests', () => {
  let handler: DeleteTeamHandler;
  let userRepo: UserRepositoryInterface;
  let teamRepo: TeamRepository;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    userRepo = new UserRepository(testDb);
    teamRepo = new TeamRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        DeleteTeamHandler,
        { provide: TeamRepository, useValue: teamRepo },
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<DeleteTeamHandler>(DeleteTeamHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should throw a BadRequestException if team not found', async () => {
    // Arrange
    const userId = v7();
    const teamReadableId = generateReadableId();
    const command = new DeleteTeamCommand(userId, teamReadableId);

    // Act & Assert

    await expect(handler.execute(command)).rejects.toThrow('Team not found');
  });

  it('should throw a ForbiddenException if user is not admin', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const anotherUser = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const team = await teamRepo.createTeam(
      user.id,
      {
        name: 'Test Team',
        description: 'A team for testing',
        readable_id: generateReadableId(),
      },
      [],
    );

    await db.insert(team_members).values([
      {
        team_id: team.id,
        user_id: anotherUser.id,
        role: teamRoles.MEMBER,
      },
    ]);

    const command = new DeleteTeamCommand(anotherUser.id, team.readableId);

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'Only admins can delete the team',
    );
  });

  it('should delete a team', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const team = await teamRepo.createTeam(
      user.id,
      {
        name: 'Test Team',
        description: 'A team for testing',
        readable_id: generateReadableId(),
      },
      [],
    );

    await expect(
      handler.execute(new DeleteTeamCommand(user.id, team.readableId)),
    ).resolves.toBeUndefined();
  });
});
