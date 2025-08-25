import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      all: true,
      include: ['server/**'],
      exclude: [
        'server/api/**',
        'server/middleware/**',
        'server/plugins/**',
        'server/database/client.ts',
        'server/utils/logger.ts',
        'server/types/**'
      ]
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '~~': path.resolve(__dirname, '.')
    }
  }
})
