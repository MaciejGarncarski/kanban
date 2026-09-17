import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '../../../core/application/guards/auth.guard.js';

export function Auth() {
  return applyDecorators(
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer access token',
      required: false,
    }),
    ApiCookieAuth(), // for Swagger documentation
    ApiBearerAuth(), // for Swagger documentation
    UseGuards(AuthGuard), // actual authorization
  );
}
