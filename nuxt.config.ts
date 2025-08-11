import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  components: true,
  css: ['~/assets/css/main.css'],
  sourcemap: false,
  modules: [
    '@pinia/nuxt',
    '@nuxt/ui'
  ],
  ssr: true,
  experimental: {
    payloadExtraction: false
  }
})
