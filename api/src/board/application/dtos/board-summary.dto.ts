import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const boardSummarySchema = z.object({
  readableId: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  teamId: z.string(),
  readableTeamId: z.string(),
  createdAt: z.coerce.date().nullish(),
});

export class BoardSummaryDto {
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
}
