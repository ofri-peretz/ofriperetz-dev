// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-11-01',

  // SEO & AEO Configuration
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'author', content: 'Ofri Peretz' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { property: 'og:site_name', content: 'Ofri Peretz' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@ofriperetzdev' },
        { name: 'twitter:creator', content: '@ofriperetzdev' }
      ],
      link: [
        { rel: 'canonical', href: 'https://ofriperetz.dev' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/logo-192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo-apple-touch.png' }
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Ofri Peretz',
            url: 'https://ofriperetz.dev',
            jobTitle: 'Engineering Leader',
            worksFor: {
              '@type': 'Organization',
              name: 'Snappy'
            },
            sameAs: [
              'https://github.com/ofri-peretz',
              'https://x.com/ofriperetzdev',
              'https://www.linkedin.com/in/ofri-peretz/',
              'https://dev.to/ofri-peretz'
            ],
            knowsAbout: [
              'TypeScript',
              'ESLint',
              'Security',
              'React',
              'Node.js',
              'Engineering Leadership'
            ]
          })
        }
      ]
    }
  },

  // Site configuration
  site: {
    url: 'https://ofriperetz.dev',
    name: 'Ofri Peretz',
    description: 'Engineering Leader & Open Source Creator - Building AI-native developer tools',
    defaultLocale: 'en'
  },

  // Runtime config for API keys (server-side only for security)
  runtimeConfig: {
    devtoApiKey: process.env.DEVTO_API_KEY || '',
    githubToken: process.env.GITHUB_TOKEN || ''
    // Note: Keys in 'runtimeConfig' (not 'public') are server-side only
  },

  nitro: {
    prerender: {
      routes: [
        '/',
        '/about',
        '/projects',
        '/articles'
      ],
      // Don't crawl links to avoid trying to prerender /stats which needs dynamic API data
      crawlLinks: false,
      ignore: ['/stats', '/api']
    }
  },

  // OG Image configuration for social sharing
  ogImage: {
    defaults: {
      component: 'NuxtSeo',
      props: {
        colorMode: 'dark'
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
