import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { boolean } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { text, timestamp, uuid, varchar, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: text().notNull(),
  created_at: timestamp('created_at', { mode: 'string' })
    .notNull()
    .default(sql`now()`),
});

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(team_members),
  assignedCards: many(cards),
  comments: many(comments),
}));

export const teams = pgTable('teams', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at', { mode: 'string' })
    .notNull()
    .default(sql`now()`),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(team_members),
  boards: many(boards),
}));

export const team_members = pgTable('team_members', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  team_id: uuid('team_id')
    .references(() => teams.id)
    .notNull(),
  user_id: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  role: varchar('role', { length: 50 }).default('member'),
  joined_at: timestamp('joined_at').defaultNow(),
});

export const teamMembersRelations = relations(team_members, ({ one }) => ({
  user: one(users, { fields: [team_members.user_id], references: [users.id] }),
  team: one(teams, { fields: [team_members.team_id], references: [teams.id] }),
}));

export const boards = pgTable('boards', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  team_id: uuid('team_id')
    .references(() => teams.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
});

export const boardsRelations = relations(boards, ({ one, many }) => ({
  team: one(teams, { fields: [boards.team_id], references: [teams.id] }),
  columns: many(columns),
}));

export const columns = pgTable('columns', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  board_id: uuid('board_id')
    .references(() => boards.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  position: integer('position').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, { fields: [columns.board_id], references: [boards.id] }),
  cards: many(cards),
}));

export const cards = pgTable('cards', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  column_id: uuid('column_id')
    .references(() => columns.id)
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assigned_to: uuid('assigned_to').references(() => users.id),
  position: integer('position').notNull(),
  due_date: timestamp('due_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const cardsRelations = relations(cards, ({ one, many }) => ({
  column: one(columns, { fields: [cards.column_id], references: [columns.id] }),
  assignee: one(users, { fields: [cards.assigned_to], references: [users.id] }),
  comments: many(comments),
}));

export const comments = pgTable('comments', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  card_id: uuid('card_id')
    .references(() => cards.id)
    .notNull(),
  author_id: uuid('author_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  card: one(cards, { fields: [comments.card_id], references: [cards.id] }),
  author: one(users, { fields: [comments.author_id], references: [users.id] }),
}));

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  revoked: boolean('revoked').notNull().default(false),
  replacedBy: uuid('replaced_by'), // ID nowego tokena po rotacji
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});
