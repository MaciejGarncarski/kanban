import { faker } from '@faker-js/faker';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { DB } from 'src/infrastructure/persistence/db/client';
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

describe('BoardRepository', () => {
  let repository: BoardRepository;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    repository = new BoardRepository(db);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should throw error when updating non-existing board', async () => {
    await expect(
      repository.updateBoard({
        readableBoardId: generateReadableId(),
        name: 'New Board Name',
      }),
    ).rejects.toThrow('Board not found');
  });

  it('should throw bad request exception when creating board for non-existing team', async () => {
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    await expect(
      repository.createBoard({
        readableTeamId: generateReadableId(),
        name: 'Test Board',
        description: 'This is a test board',
        userId: newUser.id,
      }),
    ).rejects.toThrow('Team not found');
  });

  it('should throw bad request exception when board already exists', async () => {
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const readableTeamId = generateReadableId();

    const [team] = await db
      .insert(teams)
      .values({
        name: faker.lorem.words(3),
        readable_id: readableTeamId,
      })
      .returning();

    const boardData = {
      readableTeamId,
      name: faker.lorem.words(3),
      description: 'This is a test board',
      userId: newUser.id,
    };

    await db.insert(boards).values({
      name: boardData.name,
      description: boardData.description,
      team_id: team.id,
      readable_id: generateReadableId(),
    });

    await expect(repository.createBoard(boardData)).rejects.toThrow(
      `Board with name "${boardData.name}" already exists in team: ${readableTeamId}`,
    );
  });

  it('should throw bad request exception when user is not a team member', async () => {
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const readableTeamId = generateReadableId();

    await db.insert(teams).values({
      name: faker.lorem.words(3),
      readable_id: readableTeamId,
    });

    await expect(
      repository.createBoard({
        readableTeamId,
        name: 'Test Board',
        description: 'This is a test board',
        userId: newUser.id,
      }),
    ).rejects.toThrow('User is not authorized to access this team');
  });

  it('should throw forbidden exception when user is not admin', async () => {
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const readableTeamId = generateReadableId();

    const [team] = await db
      .insert(teams)
      .values({
        name: faker.lorem.words(3),
        readable_id: readableTeamId,
      })
      .returning();

    await db.insert(team_members).values({
      team_id: team.id,
      user_id: newUser.id,
      role: teamRoles.MEMBER,
    });

    await expect(
      repository.createBoard({
        readableTeamId,
        name: 'Test Board',
        description: 'This is a test board',
        userId: newUser.id,
      }),
    ).rejects.toThrow(
      `User does not have permission to create a board in team: ${readableTeamId}`,
    );
  });

  it('should throw bad request exception when deleting non-existing board', async () => {
    const id = generateReadableId();

    await expect(repository.deleteBoardById(id)).rejects.toThrow(
      `Board not found for readable_id: ${id}`,
    );
  });

  it('should return valid cards and columns when fetching board by id', async () => {
    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const readableTeamId = generateReadableId();

    const [team] = await db
      .insert(teams)
      .values({
        name: faker.lorem.words(3),
        readable_id: readableTeamId,
      })
      .returning();

    await db.insert(team_members).values({
      team_id: team.id,
      user_id: newUser.id,
      role: teamRoles.ADMIN,
    });

    const board = await repository.createBoard({
      readableTeamId,
      name: 'Test Board',
      description: 'This is a test board',
      userId: newUser.id,
    });

    const columnName = faker.lorem.words(2);

    const [column] = await db
      .insert(columns)
      .values({
        name: columnName,
        board_id: board.id,
        position: 1,
      })
      .returning();

    const cardName1 = faker.lorem.words(3);
    const cardName2 = faker.lorem.words(3);

    await db.insert(cards).values([
      {
        title: cardName1,
        description: 'Card 1 Description',
        column_id: column.id,
        position: 1,
      },
      {
        title: cardName2,
        description: 'Card 2 Description',
        column_id: column.id,
        position: 2,
      },
    ]);

    const fetchedBoard = await repository.findById(
      newUser.id,
      board.readableId,
    );

    expect(fetchedBoard).toBeDefined();

    if (!fetchedBoard) {
      throw new Error('Fetched board is undefined');
    }

    expect(fetchedBoard.columns).toHaveLength(1);
    expect(fetchedBoard?.columns?.[0].name).toBe(columnName);
    expect(fetchedBoard?.columns?.[0].cards).toHaveLength(2);
    expect(fetchedBoard?.columns?.[0].cards[0].title).toBe(cardName1);
    expect(fetchedBoard?.columns?.[0].cards[1].title).toBe(cardName2);
  });
});
