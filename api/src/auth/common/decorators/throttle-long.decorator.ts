import { applyDecorators } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

export function ThrottleLong() {
  return applyDecorators(SkipThrottle({ short: false }));
}
