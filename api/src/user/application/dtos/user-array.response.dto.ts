import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { UserResponseDto, userResponseSchema } from './user.response.dto.js';

export const userArrayResponseSchema = z.object({
  users: z.array(userResponseSchema),
});

export class UserArrayResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Array of users',
  })
  users: UserResponseDto[];
}
