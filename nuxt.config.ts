import { getPrerenderRoutes, getStaticPageRoutes } from './scripts/site-routes.mjs'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'app',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxtjs/color-mode'
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'AbdurRahaman Shah — Articles', href: 'https://www.arhmn.sh/rss.xml' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  colorMode: {
    classSuffix: ''
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}
    }
  },
  runtimeConfig: {
    siteStaticRoutes: getStaticPageRoutes(),
    public: {
      posthogPublicKey: '',
      posthogHost: ''
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      autoSubfolderIndex: true,
      routes: [...getPrerenderRoutes(), '/sitemap.xml', '/rss.xml']
    }
  }
})
