// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/test-utils',
    '@nuxt/ui'
  ],

  nitro: {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    },
    security: {
      headers: {
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          'base-uri': ["'self'"],
          'font-src': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'none'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'object-src': ["'none'"],
          'script-src-attr': ["'none'"],
          'style-src': ["'self'"],
          'upgrade-insecure-requests': true,
        },
      },
    },
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret-change-in-production',
    logLevel: process.env.LOG_LEVEL || 'info',
    public: {
      apiBase: process.env.API_BASE_URL || '/api',
    }
  }
})