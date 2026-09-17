import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createCardRequestSchema = z
  .object({
    title: z.string().max(32, { error: 'Title is too long' }),
    columnId: z.string(),
    description: z
      .string()
      .max(500, { error: 'Description is too long' })
      .optional(),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional(),
  })
  .strict();

export type CreateCardRequest = z.infer<typeof createCardRequestSchema>;

export class CreateCardRequestDto {
  @ApiProperty({ example: 'Title' })
  readonly title: string;

  @ApiProperty({ example: 'column-uuid' })
  readonly columnId: string;

  @ApiProperty({ example: 'Description', required: false })
  readonly description?: string;

  @ApiProperty({ example: '2023-01-01', required: false })
  readonly dueDate?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  readonly assignedTo?: string;
}
