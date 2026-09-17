import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import {
  ColumnDto,
  columnSchema,
} from '../../../column/application/dtos/column.dto.js';

export const boardDetailSchema = z.object({
  readableId: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  teamId: z.string(),
  readableTeamId: z.string(),
  createdAt: z.coerce.date().nullish(),
  columns: z.array(columnSchema),
});

export class BoardDetailDto {
  @ApiProperty()
  readableId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description: string;

  @ApiProperty()
  teamId: string;

  @ApiProperty()
  readableTeamId: string;

  @ApiProperty({ required: false })
  createdAt: string;

  @ApiProperty({
    type: [ColumnDto],
    description: 'List of columns with their cards',
  })
  columns: ColumnDto[];
}
