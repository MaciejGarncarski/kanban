import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createBoardRequestSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    readableTeamId: z.string(),
  })
  .strict();

export type CreateBoardRequest = z.infer<typeof createBoardRequestSchema>;

export class CreateBoardRequestDto {
  @ApiProperty({
    description: 'Name of the board',
    example: 'Project Roadmap',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the board',
    example: 'A detailed description of the project roadmap',
  })
  description: string;

  @ApiProperty({
    description: 'ID of the team to which the board belongs',
    example: 'team-12345',
  })
  readableTeamId: string;
}
