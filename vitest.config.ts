import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./packages/renderer/src/test/setup.ts'],
    include: ['packages/**/src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['packages/**/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/test/**',
        '**/tests/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        'packages/renderer/src/app/**',
        'packages/main/src/index.ts',
        'packages/main/src/preload.ts',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/renderer/src'),
    },
  },
})
