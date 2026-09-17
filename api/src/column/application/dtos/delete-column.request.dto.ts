import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const deleteColumnRequestSchema = z
  .object({
    columnId: z.string().min(1),
  })
  .strict();

export type DeleteColumnRequest = z.infer<typeof deleteColumnRequestSchema>;

export class DeleteColumnRequestDto {
  @ApiProperty({
    example: 'column-12345',
  })
  columnId: string;
}
