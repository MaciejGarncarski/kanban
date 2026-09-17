import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateColumnRequestSchema = z
  .object({
    name: z.string().optional(),
    position: z.number().positive().optional(),
  })
  .strict();

export type UpdateColumnRequest = z.infer<typeof updateColumnRequestSchema>;

export class UpdateColumnRequestDto {
  @ApiProperty({ required: false, example: 'New Column Name' })
  name?: string;

  @ApiProperty({ required: false, example: 2 })
  position?: number;
}

export const updateColumnParamsSchema = z
  .object({
    columnId: z.string(),
  })
  .strict();

export type UpdateColumnParams = z.infer<typeof updateColumnParamsSchema>;

export class UpdateColumnParamsDto {
  @ApiProperty({ example: 'column-uuid' })
  columnId: string;
}
