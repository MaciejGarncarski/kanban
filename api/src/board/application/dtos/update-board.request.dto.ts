import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateBoardRequestSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
  })
  .strict();

export type UpdateBoardRequest = z.infer<typeof updateBoardRequestSchema>;

export class UpdateBoardRequestDto {
  @ApiProperty({ example: 'name' })
  name: string;

  @ApiProperty({ example: 'description' })
  description?: string;
}

export const updateBoardParamsSchema = z
  .object({
    readableBoardId: z.string(),
  })
  .strict();

export type UpdateBoardParams = z.infer<typeof updateBoardParamsSchema>;

export class UpdateBoardParamsDto {
  @ApiProperty({
    example: '7f3b2c1e-1c4d-4f5e-8b2f-1c4d5e8b2f1c',
    description: 'Board ID',
  })
  readableBoardId: string;
}
