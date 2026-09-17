import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const getBoardsByTeamRequestSchema = z
  .object({
    readableTeamId: z.string(),
  })
  .strict();

export type GetBoardsByTeamRequest = z.infer<
  typeof getBoardsByTeamRequestSchema
>;

export class GetBoardsByTeamRequestDto {
  @ApiProperty({
    example: 'nanoid',
    description: 'Team ID',
  })
  readableTeamId: string;
}
