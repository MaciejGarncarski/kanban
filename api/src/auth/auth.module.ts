import { Module } from '@nestjs/common';
import { AuthController } from './infrastructure/controllers.ts/auth.controller';
import { UserRepository } from 'src/user/user.repository';
import { SignInUserHandler } from 'src/auth/application/commands/handlers/sign-in-user.handler';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthController],
  providers: [SignInUserHandler, UserRepository],
})
export class AuthModule {}
