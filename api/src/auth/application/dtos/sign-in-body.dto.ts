import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';

export class SignInBodyDto {
  @ApiProperty({ example: userFixture.email, description: 'User email' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: userFixture.password, description: 'User password' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
