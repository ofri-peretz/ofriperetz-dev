<script setup lang="ts">
/**
 * StatsPreviewNorthStar - Community Impact preview for home page
 * Shows impressive metrics in a compact horizontal layout
 */

const { stats: githubStats, loading, fetchStats } = useGitHubStats()
const { totalDownloads, fetchStats: fetchNpm } = useNpmStats()
const {
  articles,
  followers: devtoFollowers,
  totalViews,
  fetchArticles
} = useDevToArticles()

// Fetch on mount
onMounted(() => {
  fetchStats()
  fetchNpm()
  fetchArticles('ofri-peretz', 100)
})

// Calculate metrics - these are the impressive numbers to show
const metrics = computed(() => [
  {
    id: 'downloads',
    label: 'Downloads',
    value: totalDownloads.value || 0,
    icon: 'i-simple-icons-npm',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  {
    id: 'views',
    label: 'Views',
    value: totalViews.value || 0,
    icon: 'i-lucide-eye',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 'followers',
    label: 'Followers',
    value: (githubStats.value?.followers || 0) + (devtoFollowers.value || 0),
    icon: 'i-lucide-users',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'articles',
    label: 'Articles',
    value: (articles.value?.length || 0) + 3, // +3 for Medium
    icon: 'i-lucide-file-text',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    id: 'commits',
    label: 'Commits',
    value: githubStats.value?.recentCommits || 0,
    icon: 'i-lucide-git-commit',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  {
    id: 'reactions',
    label: 'Reactions',
    value:
      articles.value?.reduce(
        (sum, a) => sum + (a.positive_reactions_count || 0),
        0
      ) || 0,
    icon: 'i-lucide-heart',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30'
  },
  {
    id: 'repos',
    label: 'Repos',
    value: githubStats.value?.totalRepos || 0,
    icon: 'i-lucide-folder-git-2',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
])

// Filter to show only metrics with values > 1 to look impressive
const impressiveMetrics = computed(() =>
  metrics.value.filter(m => m.value > 1).slice(0, 7)
)

// Hover state
const hoveredMetric = ref<string | null>(null)

// Format numbers compactly
const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-primary-500/30 bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-800/80 p-5"
  >
    <!-- Subtle background glow -->
    <div
      class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"
    />
    <div
      class="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"
    />

    <div class="relative z-10">
      <!-- Header - More meaningful title -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div
            class="p-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="w-4 h-4 text-primary-500"
            />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              Community Impact
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Open Source Contributions
            </p>
          </div>
        </div>
      </div>

      <!-- Metrics Grid - Horizontal layout with more columns -->
      <div class="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
        <div
          v-for="metric in impressiveMetrics"
          :key="metric.id"
          class="group relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer"
          :class="[
            metric.bgColor,
            metric.borderColor,
            hoveredMetric === metric.id
              ? 'scale-105 shadow-lg'
              : 'hover:scale-102'
          ]"
          @mouseenter="hoveredMetric = metric.id"
          @mouseleave="hoveredMetric = null"
        >
          <div class="flex flex-col items-center text-center">
            <UIcon
              :name="metric.icon"
              class="w-4 h-4 mb-1 transition-transform duration-200"
              :class="[
                metric.color,
                hoveredMetric === metric.id && 'scale-110'
              ]"
            />
            <div
              class="text-lg font-bold tabular-nums text-gray-900 dark:text-white leading-tight"
            >
              <span
                v-if="loading"
                class="animate-pulse text-sm"
              >...</span>
              <template v-else>
                {{ formatNumber(metric.value) }}
              </template>
            </div>
            <div
              class="text-[10px] text-gray-500 dark:text-gray-400 leading-tight truncate w-full"
            >
              {{ metric.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Button - Compact -->
      <div class="flex justify-center">
        <NuxtLink to="/stats?view=web">
          <ShimmerButton class="py-2! px-4!">
            <span class="flex items-center gap-2 text-sm font-medium">
              <UIcon
                name="i-lucide-bar-chart-3"
                class="w-4 h-4"
              />
              View Full Dashboard
              <UIcon
                name="i-lucide-arrow-right"
                class="w-3 h-3"
              />
            </span>
          </ShimmerButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover\:scale-102:hover {
  transform: scale(1.02);
}
</style>
