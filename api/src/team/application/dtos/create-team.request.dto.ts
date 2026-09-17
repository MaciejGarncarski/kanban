import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createTeamRequestSchema = z
  .object({
    name: z.string({ error: 'Name must be a string' }).max(32, {
      error: 'Name is too long',
    }),
    description: z
      .string({ error: 'Description must be a string' })
      .max(500, { error: 'Description is too long' })
      .optional(),
    members: z.array(z.string()).optional(),
  })
  .strict();

export type CreateTeamRequest = z.infer<typeof createTeamRequestSchema>;

export class CreateTeamRequestDto {
  @ApiProperty({ description: 'Name of the team' })
  name: string;

  @ApiProperty({ description: 'Description of the team', required: false })
  description?: string;

  @ApiProperty({ description: 'Array of member user IDs', required: false })
  members?: string[];
}
