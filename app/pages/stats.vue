<script setup lang="ts">
import { STARS_VISIBILITY_THRESHOLD } from '~/utils/constants'

// Add error state for graceful degradation
const pageError = ref<string | null>(null)

// URL-based state management for deep links
const route = useRoute()
const router = useRouter()

// Read initial view mode from URL or default to 'classic'
const funnelMode = ref<'classic' | 'web'>(
  (route.query.view as 'classic' | 'web') || 'classic'
)

// Sync view mode changes to URL
watch(funnelMode, (newMode) => {
  router.replace({
    query: { ...route.query, view: newMode }
  })
})

const {
  stats: homeStats,
  loading: homeLoading,
  fetchStats: fetchHomeStats
} = useHomepageStats()

const {
  articles,
  followers: devtoFollowers,
  totalViews: devtoViews,
  loading: articlesLoading,
  fetchArticles
} = useDevToArticles()
const {
  stats: npmStats,
  loading: npmLoading,
  totalDownloads,
  fetchStats: fetchNpmStats
} = useNpmStats()
const {
  stats: githubStats,
  loading: githubLoading,
  fetchStats: fetchGitHubStats
} = useGitHubStats()

// Early stage mode: hide correlation analysis until we have meaningful star data
const isEarlyStage = computed(() =>
  (githubStats.value?.totalStars || homeStats.value?.github?.totalStars || 0) < STARS_VISIBILITY_THRESHOLD
)

// Fetch data on mount with prioritized staggering for perceived performance
// Priority: Homepage Stats (Instant landing) > GitHub (hero stars) > npm (main metrics) > articles (secondary)
onMounted(async () => {
  try {
    // Priority 0: Homepage Stats for near-instant metric landing
    await fetchHomeStats()

    // Priority 1: GitHub stats for hero section (shows first)
    await fetchGitHubStats()

    // Priority 2: npm stats in parallel with Dev.to (both important for main view)
    await Promise.allSettled([
      fetchNpmStats(),
      fetchArticles('ofri-peretz', 100)
    ])
  } catch (e) {
    console.error('Error fetching stats data:', e)
    pageError.value = 'Some data may be temporarily unavailable'
  }
})

// Computed stats - with null safety
const totalArticles = computed(() => articles.value?.length || 0)
const totalViews = computed(() => devtoViews.value || 0)

const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0
    ) || 0
)
const totalComments = computed(
  () =>
    articles.value?.reduce((sum, a) => sum + (a.comments_count || 0), 0) || 0
)
const totalReadingTime = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.reading_time_minutes || 0),
      0
    ) || 0
)

// Combined reactions: GitHub stars + dev.to reactions (no Medium - no free API)
const _totalReactions = computed(
  () => (githubStats.value?.totalStars || 0) + devtoReactions.value
)

// Combined followers from all platforms (GitHub + dev.to)
const totalFollowers = computed(
  () => (githubStats.value?.followers || 0) + (devtoFollowers.value || 0)
)

// Top packages by downloads (top 8) - with null safety
const _topPackages = computed(() => {
  if (!npmStats.value || !Array.isArray(npmStats.value)) return []
  return npmStats.value.slice(0, 8).map(pkg => ({
    name: pkg.name || 'Unknown',
    downloads: pkg.downloads || 0
  }))
})

// Aggregate daily downloads for sparkline - with null safety
const dailyDownloads = computed(() => {
  if (!npmStats.value || !Array.isArray(npmStats.value)) return []
  const dayMap: Record<string, number> = {}
  npmStats.value.forEach((pkg) => {
    pkg.dailyData?.forEach((d) => {
      dayMap[d.day] = (dayMap[d.day] || 0) + d.downloads
    })
  })
  return Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, downloads]) => ({ day, downloads }))
})

// Toggle state for Daily vs Cumulative view
const showCumulative = ref(false)

// Cumulative downloads computed from daily data
const cumulativeDownloads = computed(() => {
  let running = 0
  return dailyDownloads.value.map((d) => {
    running += d.downloads
    return { day: d.day, downloads: running }
  })
})

// Active chart data based on toggle
const _chartDisplayData = computed(() =>
  showCumulative.value ? cumulativeDownloads.value : dailyDownloads.value
)

// Format numbers
const _formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Language colors
const _langColors: Record<string, string> = {
  TypeScript: 'from-blue-500 to-blue-400',
  JavaScript: 'from-yellow-500 to-yellow-400',
  Python: 'from-green-500 to-green-400',
  Vue: 'from-emerald-500 to-emerald-400',
  HTML: 'from-orange-500 to-orange-400',
  CSS: 'from-purple-500 to-purple-400'
}

// Get color for package rank
const _getPackageColor = (index: number) => {
  const colors = [
    'from-indigo-500 to-indigo-400',
    'from-green-500 to-green-400',
    'from-blue-500 to-blue-400',
    'from-purple-500 to-purple-400',
    'from-orange-500 to-orange-400',
    'from-pink-500 to-pink-400',
    'from-teal-500 to-teal-400',
    'from-red-500 to-red-400'
  ]
  return colors[index] || 'from-gray-500 to-gray-400'
}

useSeoMeta({
  title: 'My Impact Dashboard - Ofri Peretz | Open Source Metrics',
  description:
    'Live metrics from 9,000+ npm downloads, 35+ GitHub repositories, and 30+ technical articles on security and ESLint.',
  ogTitle: 'My Impact Dashboard - Ofri Peretz',
  ogDescription:
    'Live open source metrics: 9K+ npm downloads, 35+ repos, 30+ articles on security & ESLint.',
  ogImage: 'https://ofriperetz.dev/og-stats.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: 'website',
  ogUrl: 'https://ofriperetz.dev/stats',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://ofriperetz.dev/og-stats.png',
  twitterTitle: 'My Impact Dashboard - Ofri Peretz',
  twitterDescription:
    'Live open source metrics: 9K+ npm downloads, 35+ repos, 30+ articles.'
})

// BreadcrumbList schema for rich snippets
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://ofriperetz.dev'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Impact Dashboard',
            'item': 'https://ofriperetz.dev/stats'
          }
        ]
      })
    }
  ]
})

// TOC items for this page - conditionally include correlation analysis
const tocItems = computed(() => {
  const isDataLoading = homeLoading.value || githubLoading.value || npmLoading.value || articlesLoading.value

  // Use a generic label while loading to avoid flashes
  const visualizationLabel = isDataLoading
    ? 'Impact Visualization'
    : (isEarlyStage.value ? 'Impact Metrics' : 'NSM Visualization')

  const baseItems = [
    { id: 'stats-header', label: 'Overview' },
    // Only show North Star Goal in TOC when not early stage
    ...(isEarlyStage.value ? [] : [{ id: 'north-star-goal', label: 'North Star Goal' }]),
    { id: 'nsm-visualization', label: visualizationLabel },
    { id: 'metrics-over-time', label: 'Metrics Over Time' }
  ]

  // Only show correlation analysis in TOC when we have meaningful data
  if (!isEarlyStage.value && !isDataLoading) {
    baseItems.push({ id: 'correlation-analysis', label: 'Correlation Analysis' })
  }

  baseItems.push(
    { id: 'downloads', label: 'NPM Downloads' },
    { id: 'stats-cta', label: 'Connect' }
  )

  return baseItems
})
</script>

<template>
  <div class="py-12 sm:py-16 lg:py-20">
    <!-- Floating TOC -->
    <FloatingToc :items="tocItems" />

    <UContainer>
      <!-- Header - no delay for immediate visibility -->
      <BlurFade :delay="0">
        <div
          id="stats-header"
          data-toc-section
          class="text-center mb-12 scroll-mt-20"
        >
          <h1
            class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            <GradientText animate>
              My Impact Dashboard
            </GradientText>
          </h1>
          <p
            class="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Live metrics from my open source projects, technical writing, and
            developer community engagement.
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated:
            {{
              new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })
            }}
          </p>
        </div>
      </BlurFade>

      <!-- North Star Hero - only show when we have meaningful star count -->
      <BlurFade
        v-if="!isEarlyStage"
        :delay="15"
      >
        <div
          id="north-star-goal"
          data-toc-section
          class="mb-8 scroll-mt-20"
        >
          <IdlePrefetch
            :timeout="800"
            root-margin="50px"
            min-height="200px"
          >
            <LazyLandingNorthStarHero
              :stars="githubStats?.totalStars || 0"
              :target-stars="100"
              :loading="githubLoading"
            />
            <template #loading>
              <div
                class="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-[200px] flex items-center justify-center"
              >
                <div class="text-gray-400">
                  Loading...
                </div>
              </div>
            </template>
          </IdlePrefetch>
        </div>
      </BlurFade>

      <!-- North Star Visualization - Conditional based on star count -->
      <BlurFade :delay="30">
        <div
          id="nsm-visualization"
          data-toc-section
          class="mb-8 scroll-mt-20"
        >
          <!-- Early Stage: Simplified Impact View (stars < threshold) -->
          <template v-if="isEarlyStage">
            <IdlePrefetch
              :timeout="1000"
              root-margin="50px"
              min-height="300px"
            >
              <LandingImpactMetricsBlock
                :downloads="totalDownloads || homeStats?.npm?.totalDownloads || 0"
                :views="totalViews || homeStats?.devto?.totalViews || 0"
                :followers="totalFollowers || (homeStats?.github?.followers + homeStats?.devto?.followers) || 0"
                :github-followers="githubStats?.followers || homeStats?.github?.followers || 0"
                :devto-followers="devtoFollowers || homeStats?.devto?.followers || 0"
                :contributions="githubStats?.totalContributions || homeStats?.github?.totalContributions || 0"
                :commits="githubStats?.recentCommits || homeStats?.github?.recentCommits || 0"
                :articles="totalArticles || homeStats?.devto?.articleCount || 0"
                :reading-minutes="totalReadingTime"
                :reactions="devtoReactions"
                :comments="totalComments"
                :packages="npmStats?.length || homeStats?.npm?.packageCount || 0"
                :loading="homeLoading ? true : (npmLoading && githubLoading && articlesLoading)"
              />
              <template #loading>
                <div
                  class="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-[300px] flex items-center justify-center"
                >
                  <div class="text-gray-400">
                    Loading metrics...
                  </div>
                </div>
              </template>
            </IdlePrefetch>
          </template>

          <!-- Full NSM Funnel View (stars >= threshold) -->
          <template v-else>
            <!-- Mode Toggle -->
            <div class="flex justify-end mb-4">
              <div
                class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs"
              >
                <button
                  :class="[
                    'px-4 py-2 transition-colors flex items-center gap-2',
                    funnelMode === 'classic'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                  @click="funnelMode = 'classic'"
                >
                  <UIcon
                    name="i-lucide-layers"
                    class="w-4 h-4"
                  />
                  Classic
                </button>
                <button
                  :class="[
                    'px-4 py-2 transition-colors flex items-center gap-2',
                    funnelMode === 'web'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                  @click="funnelMode = 'web'"
                >
                  <UIcon
                    name="i-lucide-network"
                    class="w-4 h-4"
                  />
                  Web
                </button>
              </div>
            </div>

            <!-- Classic Funnel View - with idle prefetch -->
            <IdlePrefetch
              :timeout="1500"
              root-margin="100px"
              min-height="400px"
            >
              <LazyLandingNorthStarFunnel
                v-if="funnelMode === 'classic'"
                :views="totalViews"
                :downloads="totalDownloads"
                :followers="totalFollowers"
                :github-followers="githubStats?.followers || 0"
                :devto-followers="devtoFollowers"
                :reactions="devtoReactions"
                :comments="totalComments"
                :stars="githubStats?.totalStars || 0"
                :stars-breakdown="githubStats?.starsBreakdown"
                :contributions="githubStats?.totalContributions || 0"
                :commits="githubStats?.recentCommits || 0"
                :articles="totalArticles"
                :reading-minutes="totalReadingTime"
                :loading="npmLoading || githubLoading || articlesLoading"
              />

              <!-- Spider Web View -->
              <LazyLandingNorthStarWeb
                v-else
                :views="totalViews"
                :downloads="totalDownloads"
                :followers="totalFollowers"
                :github-followers="githubStats?.followers || 0"
                :devto-followers="devtoFollowers"
                :reactions="devtoReactions"
                :comments="totalComments"
                :stars="githubStats?.totalStars || 0"
                :contributions="githubStats?.totalContributions || 0"
                :commits="githubStats?.recentCommits || 0"
                :articles="totalArticles"
                :reading-minutes="totalReadingTime"
                :loading="npmLoading || githubLoading || articlesLoading"
              />
              <template #loading>
                <div
                  class="bg-slate-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 h-[400px] flex flex-col items-center justify-center gap-4"
                >
                  <div class="relative">
                    <div class="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                    <UIcon
                      name="i-lucide-activity"
                      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-pulse"
                    />
                  </div>
                  <div class="flex flex-col items-center gap-1">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">Analyzing Data Patterns</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Preparing high-fidelity visualization...</span>
                  </div>
                </div>
              </template>
            </IdlePrefetch>
          </template>
        </div>
      </BlurFade>

      <!-- Metrics Over Time Chart - already lazy, reduced delay -->
      <BlurFade :delay="45">
        <div
          id="metrics-over-time"
          data-toc-section
          class="mb-8 scroll-mt-20"
        >
          <LazyLandingMetricsOverTimeChart />
        </div>
      </BlurFade>

      <!-- Effort vs Stars Correlation Chart - only show when we have meaningful star variance -->
      <BlurFade
        v-if="!isEarlyStage"
        :delay="60"
      >
        <div
          id="correlation-analysis"
          data-toc-section
          class="mb-8 scroll-mt-20"
        >
          <LazyLandingEffortStarsCorrelation />
        </div>
      </BlurFade>

      <!-- Downloads by Package - already lazy, reduced delay -->
      <BlurFade :delay="75">
        <div
          id="downloads"
          data-toc-section
          class="mb-8 scroll-mt-20"
        >
          <LazyLandingDownloadsByPackage
            :packages="npmStats || []"
            :loading="npmLoading"
          />
        </div>
      </BlurFade>

      <!-- CTA - minimal delay -->
      <BlurFade :delay="90">
        <div
          id="stats-cta"
          data-toc-section
          class="text-center scroll-mt-20"
        >
          <!-- Let's Talk CTA -->
          <LinkedInCTA />
        </div>
      </BlurFade>
    </UContainer>
  </div>
</template>
