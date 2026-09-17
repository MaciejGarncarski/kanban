import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.coerce.date().nullish(),
});

export class UserResponseDto {
  @ApiProperty({
    example: '0199f343-b727-7971-a165-2c495b512976',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: 'Alice',
    description: 'User name',
  })
  name: string;

  @ApiProperty({
    example: 'alice@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  createdAt: string;
}
