import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const deleteBoardRequestSchema = z
  .object({
    readableBoardId: z.string().min(1),
  })
  .strict();

export type DeleteBoardRequest = z.infer<typeof deleteBoardRequestSchema>;

export class DeleteBoardRequestDto {
  @ApiProperty({
    description: 'The ID of the board to delete',
    example: 'board-123',
  })
  readableBoardId: string;
}
