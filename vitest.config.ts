import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Optional: to use Vitest globals like vi, describe, it without importing
    environment: 'node', // Or 'nuxt' if available and appropriate
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['server/api/**/*.ts'], // Specify files to include in coverage
      exclude: [ // Specify files/patterns to exclude
        'server/database/index.ts', // Exclude Prisma client instantiation
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        'tests/**/*', // Exclude test files themselves from coverage report
        'nuxt.config.ts',
        'app.vue',
      ],
      all: true, // Ensure all files in `include` are processed, even if no tests import them
    },
    setupFiles: ['./tests/setup/vitest.setup.ts'], // Path to the setup file
    include: ['tests/**/*.test.ts'], // Pattern to find test files
    alias: {
      '~/server': '/server', // Alias for server directory
      '#imports': './.nuxt/imports.d.ts', // Common Nuxt alias, might need adjustment
    }
  },
});
