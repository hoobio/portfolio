import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/**/*.ts'],
      // Raised from 70/40/70/70: the emitter is more testable than the old
      // Fastify wiring it replaced (emit-static.test.ts:76.8/61.8/88.6/78.5
      // as measured). sbom-loader.ts's remote-fetch branches (unused now
      // that everything is local files) hold branch coverage back a little.
      thresholds: {
        statements: 75,
        branches: 55,
        functions: 85,
        lines: 75,
      },
    },
  },
});
