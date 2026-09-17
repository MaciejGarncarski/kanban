import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createColumnRequestSchema = z
  .object({
    title: z.string().max(24, { error: 'Title is too long' }),
    readableBoardId: z.string(),
  })
  .strict();

export type CreateColumnRequest = z.infer<typeof createColumnRequestSchema>;

export class CreateColumnRequestDto {
  @ApiProperty({ example: 'To Do', description: 'Title of the column' })
  title: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the board the column belongs to',
  })
  readableBoardId: string;
}
