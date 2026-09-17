import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { userFixture } from '../../../__tests__/fixtures/user.fixture.js';

export const registerBodySchema = z
  .object({
    email: z.email(),
    name: z.string({ error: 'Name must be a string' }),
    password: z.string({ error: 'Password must be a string' }),
    confirmPassword: z.string({ error: 'Confirm Password must be a string' }),
  })
  .strict();

export type RegisterBody = z.infer<typeof registerBodySchema>;

export class RegisterBodyDto {
  @ApiProperty({ example: userFixture.email, description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;

  @ApiProperty({ example: userFixture.password, description: 'User password' })
  password: string;

  @ApiProperty({
    example: userFixture.password,
    description: 'Password confirmation',
  })
  confirmPassword: string;
}
