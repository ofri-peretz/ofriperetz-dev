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
        // Person Schema
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            'name': 'Ofri Peretz',
            'url': 'https://ofriperetz.dev',
            'image': 'https://ofriperetz.dev/ofri-profile.webp',
            'jobTitle': 'Engineering Leader',
            'description': 'Engineering Leader & Open Source Creator. Building security-focused ESLint plugins with 9K+ downloads.',
            'worksFor': {
              '@type': 'Organization',
              'name': 'Snappy',
              'url': 'https://snappy.com'
            },
            'sameAs': [
              'https://github.com/ofri-peretz',
              'https://x.com/ofriperetzdev',
              'https://www.linkedin.com/in/ofri-peretz/',
              'https://dev.to/ofri-peretz',
              'https://medium.com/@ofriperetzdev'
            ],
            'knowsAbout': [
              'TypeScript',
              'JavaScript',
              'ESLint',
              'Application Security',
              'React',
              'Node.js',
              'Engineering Leadership',
              'Open Source Software',
              'AI-Native Development'
            ]
          })
        },
        // WebSite Schema with SearchAction for sitelinks
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'Ofri Peretz',
            'alternateName': 'ofriperetz.dev',
            'url': 'https://ofriperetz.dev',
            'description': 'Personal portfolio of Ofri Peretz - Engineering Leader & Open Source Creator',
            'author': {
              '@type': 'Person',
              'name': 'Ofri Peretz'
            }
          })
        },
        // Organization Schema for Interlace ESLint Ecosystem
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Interlace ESLint Ecosystem',
            'applicationCategory': 'DeveloperApplication',
            'operatingSystem': 'Cross-platform',
            'description': 'A collection of 16+ production-ready ESLint plugins with 272 security rules designed for the AI/Agentic era.',
            'author': {
              '@type': 'Person',
              'name': 'Ofri Peretz',
              'url': 'https://ofriperetz.dev'
            },
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            },
            'url': 'https://github.com/AriPeretz/eslint'
          })
        },
        // FAQPage Schema for rich snippets
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'What is the Interlace ESLint Ecosystem?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'The Interlace ESLint Ecosystem is a collection of 16+ production-ready ESLint plugins designed for the AI/Agentic era. These plugins feature LLM-optimized error messages that empower both human developers and AI coding assistants to catch and fix security vulnerabilities automatically.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Why AI-native ESLint plugins?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Traditional ESLint error messages are designed for human developers reading them in an IDE. As AI coding assistants become more prevalent, there\'s a need for error messages that are also machine-parseable and provide clear remediation guidance. Our plugins bridge this gap.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Which security standards do the plugins cover?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'The plugins provide comprehensive coverage for OWASP Top 10 2021, OWASP Mobile 2024, and framework-specific security patterns for Express, NestJS, Lambda, and more. Each plugin includes detailed documentation with Known False Negatives disclosure.'
                }
              },
              {
                '@type': 'Question',
                'name': 'What technologies does Ofri Peretz work with?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Languages: TypeScript, JavaScript, Node.js. Frameworks: React, Express, NestJS. Backend: Kafka, Redis, Serverless. Cloud: AWS, Docker, Kubernetes. DevEx: ESLint, Nx Monorepos, CLIs.'
                }
              }
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

  // Content module configuration - disable syntax highlighting to reduce bundle by ~600KB
  // Since we use YAML content without code blocks, Shiki highlighting is not needed
  content: {
    build: {
      markdown: {
        // Disable Shiki syntax highlighting entirely - saves ~622KB
        highlight: false
      }
    }
  },

  vite: {
    build: {
      cssMinify: true,
      // Disable sourcemaps in production for smaller bundles
      sourcemap: false,
      // DISABLED: Both Terser and esbuild cause TDZ (Temporal Dead Zone) errors
      // The MDC parser from @nuxt/content has complex nested scopes that
      // confuse minifier variable renaming, causing "Cannot access 'X' before initialization"
      // Vercel's edge compression (gzip/brotli) provides good compression without this risk
      minify: false,
      rollupOptions: {
        output: {
          // Improved chunking strategy for better code-splitting
          manualChunks(id) {
            // Vendor chunks for large dependencies
            if (id.includes('node_modules')) {
              // Reka UI components (from @nuxt/ui)
              if (id.includes('@reka-ui') || id.includes('reka-ui')) {
                return 'vendor-reka'
              }
              // Motion library
              if (id.includes('motion-v') || id.includes('@vueuse/motion')) {
                return 'vendor-motion'
              }
              // Radix Vue primitives
              if (id.includes('radix-vue')) {
                return 'vendor-radix'
              }
              // Tailwind variants
              if (id.includes('tailwind-variants')) {
                return 'vendor-tv'
              }
            }

            // App-level component chunks (lazy-loaded)
            // Stats page components
            if (id.includes('/landing/MetricsOverTimeChart') ||
                id.includes('/landing/EffortStarsCorrelation') ||
                id.includes('/landing/DownloadsByPackage')) {
              return 'stats-charts'
            }
            // North Star visualizations
            if (id.includes('/landing/NorthStarFunnel') ||
                id.includes('/landing/NorthStarWeb') ||
                id.includes('/landing/NorthStarHero')) {
              return 'stats-northstar'
            }
            // Early stage view
            if (id.includes('/landing/EarlyStageImpactView')) {
              return 'stats-early'
            }
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
