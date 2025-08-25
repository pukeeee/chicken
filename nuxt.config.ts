// eslint-disable-next-line @typescript-eslint/no-unused-vars
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  components: true,
  css: ['~/assets/css/main.css'],
  sourcemap: false,
  modules: [
    '@pinia/nuxt',
    '@nuxt/ui',
    '@nuxt/test-utils/module'
  ],
  ssr: true,
  pinia: {
    storesDirs: ['./stores/**']
  },
  // Оптимизация сборки
  nitro: {
    // Кэширование на стороне сервера
    storage: {
      redis: {
        driver: 'redis',
        // конфигурация Redis если используется
      }
    }
  }
})
