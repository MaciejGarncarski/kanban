import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateTeamRequestSchema = z
  .object({
    name: z
      .string({ error: 'Name must be a string' })
      .max(32, { error: 'Name is too long' })
      .optional(),
    description: z
      .string({ error: 'Description must be a string' })
      .max(500, { error: 'Description is too long' })
      .optional(),
    members: z.array(z.string()).optional(),
  })
  .strict();

export type UpdateTeamRequest = z.infer<typeof updateTeamRequestSchema>;

export class UpdateTeamRequestDto {
  @ApiProperty({ description: 'Name of the team' })
  name?: string;

  @ApiProperty({ description: 'Description of the team', required: false })
  description?: string;

  @ApiProperty({ description: 'Array of member user IDs', required: false })
  members?: string[];
}

export const updateTeamParamsSchema = z
  .object({
    readableTeamId: z.string(),
  })
  .strict();

export type UpdateTeamParams = z.infer<typeof updateTeamParamsSchema>;

export class UpdateTeamParamsDto {
  @ApiProperty({ description: 'ID of the team' })
  readableTeamId: string;
}
