import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setup.ts'],
      include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov', 'json-summary'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx'],
        thresholds: {
          statements: 55,
          branches: 40,
          functions: 60,
          lines: 55,
        },
      },
    },
  }),
);
