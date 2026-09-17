import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const teamSchema = z.object({
  readableId: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  createdAt: z.coerce.date().nullish(),
});

export class TeamDto {
  @ApiProperty({ example: 'nanoid' })
  readableId: string;

  @ApiProperty({ example: 'Awesome Team' })
  name: string;

  @ApiProperty({
    example: 'This is an awesome team working on great projects.',
    required: false,
  })
  description: string;

  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  createdAt: string;
}
