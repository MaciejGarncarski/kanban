import { IsEmail, IsString } from 'class-validator';

export class RegisterBody {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}
