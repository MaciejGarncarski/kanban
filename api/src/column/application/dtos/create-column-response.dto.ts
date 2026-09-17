import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createColumnResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  boardId: z.string(),
  createdAt: z.coerce.date().nullish(),
  position: z.number(),
});

export class CreateColumnResponseDto {
  @ApiProperty({ name: 'id', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ name: 'name', example: 'To Do' })
  name: string;

  @ApiProperty({
    name: 'boardId',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  boardId: string;

  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  createdAt: string;

  @ApiProperty({ example: 1 })
  position: number;
}
