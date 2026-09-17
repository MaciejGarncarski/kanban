import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { TeamDto, teamSchema } from './team.dto.js';

export const getTeamsResponseSchema = z.object({
  teams: z.array(teamSchema),
});

export class GetTeamsResponseDto {
  @ApiProperty({ type: [TeamDto], description: 'List of teams for the user' })
  teams: TeamDto[];
}
