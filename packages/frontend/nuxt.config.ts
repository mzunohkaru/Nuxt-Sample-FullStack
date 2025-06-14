// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_URL || "http://localhost:3001/api/v1",
    },
  },

  app: {
    head: {
      title: "フルスタックアプリケーション",
      meta: [
        {
          name: "description",
          content: "Nuxt.js + Express.jsフルスタックアプリケーション",
        },
      ],
    },
  },
});
