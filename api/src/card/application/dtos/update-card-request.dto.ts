import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateCardParamSchema = z
  .object({
    cardId: z.string(),
  })
  .strict();

export type UpdateCardParam = z.infer<typeof updateCardParamSchema>;

export class UpdateCardParamDto {
  @ApiProperty({ example: 'card-uuid' })
  cardId: string;
}

export const updateCardRequestSchema = z
  .object({
    title: z.string().max(32, { error: 'Title is too long' }).optional(),
    description: z
      .string()
      .max(500, { error: 'Description is too long' })
      .optional(),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional(),
    position: z.number().positive().optional(),
    columnId: z.string().optional(),
  })
  .strict();

export type UpdateCardRequest = z.infer<typeof updateCardRequestSchema>;

export class UpdateCardRequestDto {
  @ApiProperty({ example: 'New Title', required: false })
  readonly title?: string;

  @ApiProperty({ example: 'New Description', required: false })
  readonly description?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  readonly dueDate?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  readonly assignedTo?: string;

  @ApiProperty({ example: 3, required: false })
  readonly position?: number;

  @ApiProperty({ example: 'column-uuid', required: false })
  readonly columnId?: string;
}
