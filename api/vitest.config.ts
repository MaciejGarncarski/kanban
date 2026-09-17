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
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.e2e-spec.ts', 'node_modules', 'dist'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    coverage: {
      provider: 'v8',
      reportsDirectory: '../coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules',
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/**/*.dto.ts',
        'src/**/*.command.ts',
        'src/**/*.query.ts',
        'src/**/*.decorator.ts',
        'src/**/*.config.ts',
        'src/**/*.schema.ts',
        'src/**/*.controller.ts',
        'src/**/*.routes.ts',
        'src/**/*.entity.ts',
        'src/infrastructure/persistence/db/**',
        'src/main.ts',
        'src/**/__tests__/**',
      ],
    },
  },
});
