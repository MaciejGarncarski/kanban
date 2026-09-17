import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
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
import { BoardRepository } from '../../../../../board/infrastructure/persistence/board.repository.js';
import { CreateCardCommand } from '../../create-card.command.js';
import { CreateCardHandler } from '../create-card.handler.js';
import { CardRepository } from '../../../../infrastructure/persistence/card.repository.js';
import { ColumnRepository } from '../../../../../column/infrastructure/persistence/column.repository.js';
import { type DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import {
  boards,
  cards,
  columns,
  team_members,
  teams,
  users,
} from '../../../../../infrastructure/persistence/db/schema.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { ProfanityCheckService } from '../../../../../infrastructure/services/profanity-check.service.js';
import { teamRoles } from '../../../../../team/domain/types/team.types.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';
import { v7 } from 'uuid';

describe('create-column-handler integration', () => {
  let handler: CreateCardHandler;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;
  let columnRepo: ColumnRepository;
  let userRepo: UserRepository;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    columnRepo = new ColumnRepository(testDb);
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule, CqrsModule],
      providers: [
        CreateCardHandler,
        ProfanityCheckService,
        BoardRepository,
        CardRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        { provide: ColumnRepository, useValue: columnRepo },
        createJWTService(),
      ],
    }).compile();

    await module.init();

    handler = module.get<CreateCardHandler>(CreateCardHandler);
  });

  it('should create a new card', async () => {
    // Arrange

    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: newUser.id,
      role: teamRoles.ADMIN,
    });

    const [newBoard] = await db
      .insert(boards)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const cardTitle = 'some title';

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const command = new CreateCardCommand(
      newUser.id,
      cardTitle,
      faker.lorem.sentence(),
      newColumn.id,
    );

    // Act
    const result = await handler.execute(command);
    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe(command.title);
  });

  it('should not create a card with duplicate title in the same column', async () => {
    // Arrange

    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: newUser.id,
      role: teamRoles.ADMIN,
    });

    const [newBoard] = await db
      .insert(boards)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const cardTitle = 'test card title';

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    await db.insert(cards).values({
      id: v7(),
      title: cardTitle,
      description: faker.lorem.sentence(),
      column_id: newColumn.id,
      position: 1,
    });

    const command = new CreateCardCommand(
      newUser.id,
      cardTitle,
      faker.lorem.sentence(),
      newColumn.id,
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'A card with this title already exists in the column',
    );
  });

  it('should not create a card if user is not in the team', async () => {
    // Arrange
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    const [newBoard] = await db
      .insert(boards)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const command = new CreateCardCommand(
      newUser.id,
      faker.lorem.words(3),
      faker.lorem.sentence(),
      newColumn.id,
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'User is not a member of the team',
    );
  });

  it('should throw an error if name contains profanity', async () => {
    // Arrange
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: newUser.id,
      role: teamRoles.ADMIN,
    });

    const [newBoard] = await db
      .insert(boards)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const command = new CreateCardCommand(
      newUser.id,
      'fuck',
      faker.lorem.sentence(),
      newColumn.id,
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'Card title contains inappropriate language',
    );
  });

  it('should throw an error if description contains profanity', async () => {
    // Arrange
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: newUser.id,
      role: teamRoles.ADMIN,
    });

    const [newBoard] = await db
      .insert(boards)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const command = new CreateCardCommand(
      newUser.id,
      faker.lorem.words(3),
      'fuck',
      newColumn.id,
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'Card description contains inappropriate language',
    );
  });
});
