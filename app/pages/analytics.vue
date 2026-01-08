<script setup lang="ts">
// Private analytics page - not shown in navigation
// Shows custom tracking data + links to Vercel dashboards

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Analytics Dashboard',
  robots: 'noindex, nofollow' // Don't index this private page
})

// Vercel dashboard links
const vercelLinks = [
  {
    label: 'Web Analytics',
    url: 'https://vercel.com/ofri-peretz/ofriperetz-dev/analytics',
    icon: 'i-lucide-bar-chart-2',
    description: 'Visitors, page views, referrers, geography'
  },
  {
    label: 'Speed Insights',
    url: 'https://vercel.com/ofri-peretz/ofriperetz-dev/speed-insights',
    icon: 'i-lucide-gauge',
    description: 'Core Web Vitals, RES scores, performance'
  },
  {
    label: 'Logs',
    url: 'https://vercel.com/ofri-peretz/ofriperetz-dev/logs',
    icon: 'i-lucide-scroll-text',
    description: 'Runtime logs, errors, function invocations'
  },
  {
    label: 'Deployments',
    url: 'https://vercel.com/ofri-peretz/ofriperetz-dev/deployments',
    icon: 'i-lucide-rocket',
    description: 'Deploy history, build logs, previews'
  }
]

// Tracking events we collect
const trackingEvents = [
  { event: 'pageview', description: 'Every page visit' },
  { event: 'contact_intent_click', description: 'Clicked "Let\'s Talk" CTA' },
  { event: 'linkedin_click', description: 'Clicked LinkedIn link' },
  { event: 'github_click', description: 'Clicked GitHub link' },
  { event: 'resume_click', description: 'Clicked resume/CV' }
]
</script>

<template>
  <div class="py-12 sm:py-16 lg:py-20">
    <UContainer>
      <!-- Header -->
      <BlurFade :delay="0">
        <div class="text-center mb-12">
          <h1
            class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            <GradientText animate>
              Analytics Dashboard
            </GradientText>
          </h1>
          <p
            class="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Private admin dashboard for monitoring site performance and visitor
            behavior.
          </p>
          <p
            class="text-sm text-red-500 dark:text-red-400 mt-2 flex items-center justify-center gap-2"
          >
            <UIcon
              name="i-lucide-lock"
              class="w-4 h-4"
            />
            This page is not indexed by search engines
          </p>
        </div>
      </BlurFade>

      <!-- Vercel Dashboard Links -->
      <BlurFade :delay="100">
        <UCard class="mb-8">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-vercel"
                class="w-5 h-5"
              />
              <h2 class="font-semibold text-gray-900 dark:text-white">
                Vercel Dashboard
              </h2>
            </div>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NuxtLink
              v-for="link in vercelLinks"
              :key="link.label"
              :to="link.url"
              target="_blank"
              class="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-start gap-3">
                <div
                  class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg"
                >
                  <UIcon
                    :name="link.icon"
                    class="w-5 h-5 text-primary-600 dark:text-primary-400"
                  />
                </div>
                <div class="flex-1">
                  <div
                    class="font-medium text-gray-900 dark:text-white flex items-center gap-1"
                  >
                    {{ link.label }}
                    <UIcon
                      name="i-lucide-external-link"
                      class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ link.description }}
                  </p>
                </div>
              </div>
            </NuxtLink>
          </div>
        </UCard>
      </BlurFade>

      <!-- Custom Tracking Events -->
      <BlurFade :delay="200">
        <UCard class="mb-8">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-activity"
                class="w-5 h-5 text-green-500"
              />
              <h2 class="font-semibold text-gray-900 dark:text-white">
                Custom Visitor Tracking
              </h2>
            </div>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Events collected via
            <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">/api/track</code>
            endpoint. View logs in Vercel Runtime Logs.
          </p>

          <div class="space-y-2">
            <div
              v-for="event in trackingEvents"
              :key="event.event"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-1 text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded"
                >
                  {{ event.event }}
                </span>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ event.description }}
              </span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              to="https://vercel.com/ofri-peretz/ofriperetz-dev/logs?search=%5BVISITOR%5D"
              target="_blank"
              class="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View visitor logs in Vercel
              <UIcon
                name="i-lucide-external-link"
                class="w-3 h-3"
              />
            </NuxtLink>
          </div>
        </UCard>
      </BlurFade>

      <!-- Data Sources Info -->
      <BlurFade :delay="300">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-database"
                class="w-5 h-5 text-blue-500"
              />
              <h2 class="font-semibold text-gray-900 dark:text-white">
                Data Sources
              </h2>
            </div>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="font-medium text-gray-900 dark:text-white mb-1">
                Vercel Analytics
              </div>
              <p class="text-gray-500 dark:text-gray-400">
                Visitors, page views, bounce rate
              </p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="font-medium text-gray-900 dark:text-white mb-1">
                Speed Insights
              </div>
              <p class="text-gray-500 dark:text-gray-400">
                Core Web Vitals, RES score
              </p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="font-medium text-gray-900 dark:text-white mb-1">
                Custom Tracking
              </div>
              <p class="text-gray-500 dark:text-gray-400">
                IP, referrer, geo, events
              </p>
            </div>
          </div>

          <div
            class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div class="flex items-start gap-2">
              <UIcon
                name="i-lucide-info"
                class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
              />
              <div>
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Vercel doesn't have a public API to
                  retrieve analytics data programmatically. Use the dashboard
                  links above to view detailed metrics.
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </BlurFade>
    </UContainer>
  </div>
</template>
