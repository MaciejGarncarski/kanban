import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';

export class RegisterBodyDto {
  @ApiProperty({ example: userFixture.email, description: 'User email' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ example: userFixture.password, description: 'User password' })
  @IsString({ message: 'Password must be a string' })
  password: string;

  @ApiProperty({
    example: userFixture.password,
    description: 'Password confirmation',
  })
  @IsString({ message: 'Confirm Password must be a string' })
  confirmPassword: string;
}
