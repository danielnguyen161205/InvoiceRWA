import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.test.js',
        '**/*.spec.js'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70
      }
    },
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules/']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './assets/js'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});
