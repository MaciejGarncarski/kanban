import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export function createJWTService(): Provider {
  return {
    provide: JwtService,
    useFactory: (configService: ConfigService) => {
      const secret = configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is missing.');
      }

      return new JwtService({
        secret,
        signOptions: { expiresIn: '1h' },
      });
    },
    inject: [ConfigService],
  };
}
