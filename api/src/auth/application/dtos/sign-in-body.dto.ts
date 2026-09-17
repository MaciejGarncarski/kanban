import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { userFixture } from '../../../__tests__/fixtures/user.fixture.js';

export const signInBodySchema = z
  .object({
    email: z.email(),
    password: z.string({ error: 'Password must be a string' }),
  })
  .strict();

export type SignInBody = z.infer<typeof signInBodySchema>;

export class SignInBodyDto {
  @ApiProperty({ example: userFixture.email, description: 'User email' })
  email: string;

  @ApiProperty({ example: userFixture.password, description: 'User password' })
  password: string;
}
