import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/common/guards/auth.guard';

export function Auth() {
  return applyDecorators(
    ApiBearerAuth(), // for Swagger documentation
    UseGuards(AuthGuard), // actual authorization
  );
}
