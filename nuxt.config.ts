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
        // Canonical and favicons - keys prevent Nuxt default favicon race condition
        { rel: 'canonical', href: 'https://ofriperetz.dev' },
        { key: 'favicon-shortcut', rel: 'shortcut icon', href: '/favicon.ico' },
        { key: 'favicon-ico', rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { key: 'favicon-32', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { key: 'favicon-16', rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { key: 'favicon-192', rel: 'icon', type: 'image/png', sizes: '192x192', href: '/logo-192.png' },
        { key: 'apple-touch-icon', rel: 'apple-touch-icon', sizes: '180x180', href: '/logo-apple-touch.png' },
        // Preload critical profile image to prevent initial blank state
        { rel: 'preload', href: '/ofri-profile.webp', as: 'image', type: 'image/webp' }
      ],
      script: [
        // Anti-FOUC: Show loading overlay immediately (runs before any CSS/JS loads)
        {
          innerHTML: `
(function() {
  // Get color mode preference  
  var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var stored = localStorage.getItem('nuxt-color-mode');
  if (stored === 'dark') isDark = true;
  if (stored === 'light') isDark = false;
  
  // Apply dark class immediately to prevent flash
  if (isDark) document.documentElement.classList.add('dark');
  
  // Create and inject loading overlay
  var loader = document.createElement('div');
  loader.id = 'app-loader';
  loader.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:1rem;"><div style="width:3rem;height:3rem;border:2px solid rgba(99,102,241,0.3);border-top-color:#6366f1;border-radius:50%;animation:spin 1s linear infinite;"></div><span style="font-size:0.875rem;color:' + (isDark ? '#9ca3af' : '#6b7280') + ';animation:pulse 2s infinite;">Loading...</span></div>';
  loader.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:' + (isDark ? '#020617' : '#ffffff') + ';transition:opacity 0.3s ease-out;';
  document.body.appendChild(loader);
  
  // Add keyframes for animations
  var style = document.createElement('style');
  style.textContent = '@keyframes spin{to{transform:rotate(360deg);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}';
  document.head.appendChild(style);
})();
          `,
          tagPosition: 'bodyOpen'
        },
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
      // Disable sourcemaps in production for smaller bundles
      sourcemap: false,
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

  typescript: {
    tsConfig: {
      compilerOptions: {
        // Allow top-level await in Vue <script setup> blocks
        module: 'ESNext',
        target: 'ES2022'
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
      // Profile image sizes (fixes console warnings)
      avatar: 128,
      avatarLg: 256,
      // Standard responsive breakpoints
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  }
})
