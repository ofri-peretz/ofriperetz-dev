<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/nuxt'
import { Analytics } from '@vercel/analytics/nuxt'

const colorMode = useColorMode()

const color = computed(() =>
  colorMode.value === 'dark' ? '#020618' : 'white'
)

// Remove the inline loader after hydration is complete
onMounted(() => {
  // Wait for next tick to ensure full hydration
  nextTick(() => {
    // Small delay to ensure CSS is applied
    setTimeout(() => {
      // Remove the inline loader injected by nuxt.config.ts
      const loader = document.getElementById('app-loader')
      if (loader) {
        loader.style.opacity = '0'
        setTimeout(() => loader.remove(), 300)
      }
    }, 100)
  })
})

// Track page views
const { trackPageView } = useVisitorTracking()
onMounted(() => {
  trackPageView()
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: '%s - Ofri Peretz',
  ogImage: '/ofri-profile.webp',
  twitterImage: '/ofri-profile.webp',
  twitterCard: 'summary_large_image'
})

const [{ data: navigation }, { data: files }] = await Promise.all([
  useAsyncData(
    'navigation',
    () => {
      return Promise.all([queryCollectionNavigation('blog')])
    },
    {
      transform: data => data.flat()
    }
  ),
  useLazyAsyncData(
    'search',
    () => {
      return Promise.all([queryCollectionSearchSections('blog')])
    },
    {
      server: false,
      transform: data => data.flat()
    }
  )
])
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        shortcut="meta_k"
        :links="navLinks"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <!-- Vercel Analytics -->
    <SpeedInsights />
    <Analytics />
  </UApp>
</template>

<style>
/* Enable smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}
</style>
