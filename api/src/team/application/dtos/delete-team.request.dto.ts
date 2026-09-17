import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const deleteTeamRequestSchema = z
  .object({
    readableTeamId: z.string(),
  })
  .strict();

export type DeleteTeamRequest = z.infer<typeof deleteTeamRequestSchema>;

export class DeleteTeamRequestDto {
  @ApiProperty({
    description: 'The ID of the team to be deleted',
  })
  readableTeamId: string;
}
