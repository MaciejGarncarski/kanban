import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  // SWC instead of esbuild: esbuild cannot emit decorator metadata,
  // which NestJS dependency injection relies on (design:paramtypes).
  esbuild: false,
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2023',
      },
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./src/__tests__/setup/shared-postgres.ts'],
    include: ['src/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
