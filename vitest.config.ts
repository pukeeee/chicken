import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    globals: true,
    projects: [
      // Проєкт для швидких юніт-тестів у середовищі Node.js
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.test.ts'],
        }
      },

      // Проєкт для тестів, що потребують повного середовища Nuxt (компоненти, композабли)
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
        }
      }),
    ],
  },
  resolve: {
    alias: {
      '~/': new URL('./app/', import.meta.url).pathname,
      '~~/': new URL('./', import.meta.url).pathname,
    }
  }
})