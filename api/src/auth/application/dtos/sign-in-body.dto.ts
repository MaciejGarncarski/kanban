import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class SignInBodyDto {
  @ApiProperty({ example: 'john@doe.com', description: 'User email' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'Abcd1234', description: 'User password' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
