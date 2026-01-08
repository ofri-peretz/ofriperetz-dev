// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'motion-v/nuxt'
    // Removed nuxt-og-image - using static OG images instead for stability
  ],

  devtools: {
    enabled: true
  },

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
        { property: 'og:title', content: 'Ofri Peretz - Engineering Leader & Open Source Creator' },
        { property: 'og:description', content: 'Building Products That Matter • Engineering Leadership • Open-Source Contributor. Creator of the Interlace ESLint Ecosystem.' },
        { property: 'og:image', content: 'https://ofriperetz.dev/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://ofriperetz.dev' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@ofriperetzdev' },
        { name: 'twitter:creator', content: '@ofriperetzdev' },
        { name: 'twitter:title', content: 'Ofri Peretz - Engineering Leader & Open Source Creator' },
        { name: 'twitter:description', content: 'Building Products That Matter • Engineering Leadership • Open-Source Contributor.' },
        { name: 'twitter:image', content: 'https://ofriperetz.dev/og-image.png' }
      ],
      link: [
        // Preconnects for external APIs (improves connection time)
        { rel: 'preconnect', href: 'https://api.github.com', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://api.npmjs.org', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://dev.to', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        // DNS prefetch for faster resolution
        { rel: 'dns-prefetch', href: 'https://api.github.com' },
        { rel: 'dns-prefetch', href: 'https://api.npmjs.org' },
        { rel: 'dns-prefetch', href: 'https://dev.to' },
        // Canonical and favicons
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
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            'name': 'Ofri Peretz',
            'url': 'https://ofriperetz.dev',
            'jobTitle': 'Engineering Leader',
            'worksFor': {
              '@type': 'Organization',
              'name': 'Snappy'
            },
            'sameAs': [
              'https://github.com/ofri-peretz',
              'https://x.com/ofriperetzdev',
              'https://www.linkedin.com/in/ofri-peretz/',
              'https://dev.to/ofri-peretz'
            ],
            'knowsAbout': [
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

  css: ['~/assets/css/main.css'],

  // Runtime config for API keys (server-side only for security)
  runtimeConfig: {
    devtoApiKey: process.env.DEVTO_API_KEY || '',
    githubToken: process.env.GITHUB_TOKEN || ''
    // Note: Keys in 'runtimeConfig' (not 'public') are server-side only
  },

  // Route rules for caching
  routeRules: {
    // Static pages - cache aggressively
    '/': { prerender: true },
    '/projects': { prerender: true },
    '/articles': { prerender: true },
    // API routes - short cache
    '/api/**': { cache: { maxAge: 60 } }
  },

  // Performance optimizations
  experimental: {
    viewTransition: true,
    payloadExtraction: true,
    componentIslands: true
  },

  compatibilityDate: '2024-11-01',

  nitro: {
    // Enable compression
    compressPublicAssets: true,
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

  vite: {
    build: {
      cssMinify: true,
      // Tree-shaking for smaller bundles
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Heavy chart/visualization components
            charts: [
              './app/components/landing/MetricsOverTimeChart.vue',
              './app/components/landing/EffortStarsCorrelation.vue',
              './app/components/landing/DownloadsByPackage.vue'
            ],
            // Heavy north star visualizations
            visualizations: [
              './app/components/landing/NorthStarFunnel.vue',
              './app/components/landing/NorthStarWeb.vue'
            ]
          }
        }
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
  },

  // Image optimization settings
  image: {
    quality: 80,
    format: ['webp', 'avif', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  }
})
