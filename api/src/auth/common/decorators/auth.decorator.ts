import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/common/guards/auth.guard';

export function Auth() {
  return applyDecorators(
    ApiCookieAuth(), // for Swagger documentation
    ApiBearerAuth(), // for Swagger documentation
    UseGuards(AuthGuard), // actual authorization
  );
}
