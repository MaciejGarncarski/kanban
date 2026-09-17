import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const deleteCardRequestSchema = z
  .object({
    cardId: z.string(),
  })
  .strict();

export type DeleteCardRequest = z.infer<typeof deleteCardRequestSchema>;

export class DeleteCardRequestDto {
  @ApiProperty({ example: 'uuid' })
  readonly cardId: string;
}
