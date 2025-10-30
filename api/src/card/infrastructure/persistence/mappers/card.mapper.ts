import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { CardEntity } from 'src/card/domain/card.entity';
import { cards } from 'src/infrastructure/persistence/db/schema';

export type CardRecord = InferSelectModel<typeof cards>;
export type NewCardRecord = InferInsertModel<typeof cards>;

export class CardMapper {
  static toDomain(record: CardRecord): CardEntity {
    const card = new CardEntity({
      id: record.id,
      title: record.title,
      description: record.description,
      position: record.position,
      assignedTo: record.assigned_to,
      columnId: record.column_id,
      createdAt: record.created_at ? new Date(record.created_at) : null,
      updatedAt: record.updated_at ? new Date(record.updated_at) : null,
      dueDate: record.due_date ? new Date(record.due_date) : null,
    });

    return card;
  }

  static toPersistence(card: CardEntity): NewCardRecord {
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      assigned_to: card.assignedTo,
      column_id: card.columnId,
      created_at: card.createdAt,
      updated_at: new Date(),
      due_date: card.dueDate,
    };
  }
}
