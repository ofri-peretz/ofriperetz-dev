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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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

  nitro: {
    prerender: {
      routes: [
        '/',
        '/about',
        '/projects',
        '/articles'
      ],
      crawlLinks: true
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
