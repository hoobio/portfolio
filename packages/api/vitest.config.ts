import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts'],
      thresholds: {
        statements: 70,
        branches: 40,
        functions: 70,
        lines: 70,
      },
    },
  },
});
