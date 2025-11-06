import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { UpdateCardHandler } from 'src/card/application/commands/handlers/update-card.handler';
import { UpdateCardCommand } from 'src/card/application/commands/update-card.command';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  cards,
  columns,
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdHandler } from 'src/user/application/queries/handlers/get-role-by-column-id.handler';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('update-card-handler integration', () => {
  let handler: UpdateCardHandler;
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
        UpdateCardHandler,
        BoardRepository,
        CardRepository,
        GetRoleByColumnIdHandler,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        { provide: ColumnRepository, useValue: columnRepo },
        createJWTService(),
      ],
    }).compile();

    await module.init();

    handler = module.get<UpdateCardHandler>(UpdateCardHandler);
  });

  it('should update a card', async () => {
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

    const cardTitle = faker.lorem.words(3);

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const [newCard] = await db
      .insert(cards)
      .values({
        id: v7(),
        title: cardTitle,
        description: faker.lorem.sentence(),
        column_id: newColumn.id,
        position: 1,
      })
      .returning();

    const command = new UpdateCardCommand(
      newUser.id,
      newCard.id,
      'Updated Card Title',
      'updated description',
      undefined,
      undefined,
      undefined,
      newColumn.id,
    );

    // Act
    await handler.execute(command);
    // Assert

    const [updatedCard] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, newCard.id));

    expect(updatedCard.title).toBe('Updated Card Title');
    expect(updatedCard.description).toBe('updated description');
  });

  it('should throw not found exception when card does not exist', async () => {
    // Arrange
    const fakeCardId = v7();
    const fakeUserId = v7();

    const command = new UpdateCardCommand(
      fakeUserId,
      fakeCardId,
      'Updated Card Title',
      'updated description',
      undefined,
      undefined,
      undefined,
      v7(),
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow('Card not found');
  });

  it('should move card to different position in the same column', async () => {
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

    const [cardOne] = await db
      .insert(cards)
      .values({
        id: v7(),
        title: 'Card One',
        description: faker.lorem.sentence(),
        column_id: newColumn.id,
        position: 1,
      })
      .returning();

    const [cardTwo] = await db
      .insert(cards)
      .values({
        id: v7(),
        title: 'Card Two',
        description: faker.lorem.sentence(),
        column_id: newColumn.id,
        position: 2,
      })
      .returning();

    const command = new UpdateCardCommand(
      newUser.id,
      cardTwo.id,
      undefined,
      undefined,
      undefined,
      newUser.id,
      1,
      newColumn.id,
    );

    // Act
    await handler.execute(command);
    // Assert

    const allCards = await db
      .select()
      .from(cards)
      .where(eq(cards.column_id, newColumn.id))
      .orderBy(cards.position);

    expect(allCards).toHaveLength(2);
    expect(allCards[0].id).toBe(cardTwo.id);
    expect(allCards[0].position).toBe(1);
    expect(allCards[1].id).toBe(cardOne.id);
    expect(allCards[1].position).toBe(2);
  });

  it('should move card to different column', async () => {
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

    const [sourceColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const [targetColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 2,
      })
      .returning();

    const [cardOne] = await db
      .insert(cards)
      .values({
        id: v7(),
        title: 'Card One',
        description: faker.lorem.sentence(),
        column_id: sourceColumn.id,
        position: 1,
      })
      .returning();

    const [cardTwo] = await db
      .insert(cards)
      .values({
        id: v7(),
        title: 'Card Two',
        description: faker.lorem.sentence(),
        column_id: sourceColumn.id,
        position: 2,
      })
      .returning();
    const command = new UpdateCardCommand(
      newUser.id,
      cardTwo.id,
      undefined,
      undefined,
      undefined,
      newUser.id,
      1,
      targetColumn.id,
    );

    // Act
    await handler.execute(command);
    // Assert

    const sourceCards = await db
      .select()
      .from(cards)
      .where(eq(cards.column_id, sourceColumn.id))
      .orderBy(cards.position);

    const targetCards = await db
      .select()
      .from(cards)
      .where(eq(cards.column_id, targetColumn.id))
      .orderBy(cards.position);

    expect(sourceCards).toHaveLength(1);
    expect(sourceCards[0].id).toBe(cardOne.id);
    expect(sourceCards[0].position).toBe(1);

    expect(targetCards).toHaveLength(1);
    expect(targetCards[0].id).toBe(cardTwo.id);
    expect(targetCards[0].position).toBe(1);
  });

  it('should throw unauthorized if user is not admin of the team', async () => {
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

    // Note: Not inserting team member record, so user is not part of the team

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

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: newUser.id,
      role: teamRoles.MEMBER,
    });

    const [newCard] = await db
      .insert(cards)
      .values({
        id: v7(),
        title: 'Card Title',
        description: faker.lorem.sentence(),
        column_id: newColumn.id,
        position: 1,
      })
      .returning();

    const command = new UpdateCardCommand(
      newUser.id,
      newCard.id,
      'Updated Card Title',
      'updated description',
      undefined,
      undefined,
      undefined,
      newColumn.id,
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'Only admins can update card details other than position.',
    );
  });
});
