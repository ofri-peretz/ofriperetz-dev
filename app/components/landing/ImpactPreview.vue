<script setup lang="ts">
/**
 * ImpactPreview - Impressive metrics showcase for home page
 * Shows key metrics in a wide horizontal layout with theme-aware accessibility
 *
 * PERFORMANCE: Uses unified /api/homepage-stats endpoint instead of 4 separate calls
 *
 * CONDITIONAL DISPLAY: When GitHub stars < STARS_VISIBILITY_THRESHOLD:
 * - Downloads metric is shown first (lead with strongest number)
 * - Once stars >= threshold, original order is restored
 */

import { STARS_VISIBILITY_THRESHOLD } from '~/utils/constants'

const { stats, loading, fetchStats } = useHomepageStats()

onMounted(() => {
  fetchStats()
})

// Early stage mode: reorder metrics when stars are below threshold
const isEarlyStage = computed(() =>
  (stats.value.github.totalStars || 0) < STARS_VISIBILITY_THRESHOLD
)

// Format large numbers compactly to prevent overflow
const formatCompact = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 100_000) return `${Math.round(value / 1_000)}K`
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

// Base metrics definitions with theme-aware colors
const viewsMetric = computed(() => ({
  label: 'Views',
  value: stats.value.devto.totalViews,
  icon: 'i-lucide-eye',
  color: 'text-cyan-600 dark:text-cyan-400',
  bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
  borderColor: 'border-cyan-200 dark:border-cyan-500/30'
}))

const downloadsMetric = computed(() => ({
  label: 'Downloads',
  value: stats.value.npm.totalDownloads,
  icon: 'i-simple-icons-npm',
  color: 'text-orange-600 dark:text-orange-400',
  bgColor: 'bg-orange-50 dark:bg-orange-500/10',
  borderColor: 'border-orange-200 dark:border-orange-500/30'
}))

const followersMetric = computed(() => ({
  label: 'Followers',
  value: stats.value.github.followers + stats.value.devto.followers,
  icon: 'i-lucide-users',
  color: 'text-blue-600 dark:text-blue-400',
  bgColor: 'bg-blue-50 dark:bg-blue-500/10',
  borderColor: 'border-blue-200 dark:border-blue-500/30'
}))

const packagesMetric = computed(() => ({
  label: 'Packages',
  value: stats.value.npm.packageCount,
  icon: 'i-lucide-package',
  color: 'text-green-600 dark:text-green-400',
  bgColor: 'bg-green-50 dark:bg-green-500/10',
  borderColor: 'border-green-200 dark:border-green-500/30'
}))

const contributionsMetric = computed(() => ({
  label: 'Contributions',
  value: stats.value.github.totalContributions || stats.value.github.recentCommits || 0,
  icon: 'i-lucide-git-commit',
  color: 'text-purple-600 dark:text-purple-400',
  bgColor: 'bg-purple-50 dark:bg-purple-500/10',
  borderColor: 'border-purple-200 dark:border-purple-500/30'
}))

const reposMetric = computed(() => ({
  label: 'Repos',
  value: stats.value.github.totalRepos,
  icon: 'i-lucide-folder-git-2',
  color: 'text-rose-600 dark:text-rose-400',
  bgColor: 'bg-rose-50 dark:bg-rose-500/10',
  borderColor: 'border-rose-200 dark:border-rose-500/30'
}))

// Computed metrics for display
// Early Stage: Downloads first (lead with strongest number)
// Post-Threshold: Original order (Views first)
const metrics = computed(() => {
  if (isEarlyStage.value) {
    // Lead with downloads (strongest metric) in early stage
    return [
      downloadsMetric.value,
      viewsMetric.value,
      followersMetric.value,
      packagesMetric.value,
      contributionsMetric.value,
      reposMetric.value
    ]
  }
  // Original order once we have meaningful star count
  return [
    viewsMetric.value,
    downloadsMetric.value,
    followersMetric.value,
    packagesMetric.value,
    contributionsMetric.value,
    reposMetric.value
  ]
})
</script>

<template>
  <section
    class="relative p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors duration-300"
    aria-labelledby="impact-title"
  >
    <!-- Subtle gradient overlay -->
    <div
      class="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary-500/5 via-transparent to-cyan-500/5 pointer-events-none"
    />

    <!-- Content -->
    <div class="relative z-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-2"
        >
          <UIcon
            name="i-lucide-trending-up"
            class="w-4 h-4 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <h2
            id="impact-title"
            class="text-xs font-bold tracking-wider text-primary-600 dark:text-primary-400 uppercase"
          >
            Open Source Impact
          </h2>
        </div>
      </div>

      <!-- Metrics Grid - 2 cols on mobile, 3 on tablet+ -->
      <div
        class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
        role="list"
        aria-label="Impact metrics"
      >
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="relative p-4 sm:p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-within:ring-2 focus-within:ring-primary-500/50 outline-none flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[130px]"
          :class="[metric.bgColor, metric.borderColor]"
          role="listitem"
        >
          <!-- Icon and Label - Centered -->
          <div class="flex items-center justify-center gap-2 mb-2">
            <div
              class="p-1 rounded-lg transition-colors"
              :class="metric.bgColor"
            >
              <UIcon
                :name="metric.icon"
                class="w-4 h-4"
                :class="metric.color"
                aria-hidden="true"
              />
            </div>
            <span
              class="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >{{ metric.label }}</span>
          </div>
          <!-- Value - Centered with responsive sizing -->
          <div
            class="font-bold tabular-nums tracking-tight text-center w-full"
            :class="[
              metric.color,
              // Responsive font size: scale down for larger numbers
              metric.value >= 1000000 ? 'text-lg sm:text-xl'
              : metric.value >= 100000 ? 'text-xl sm:text-2xl'
                : metric.value >= 10000 ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'
            ]"
          >
            <span
              v-if="loading"
              class="animate-pulse text-lg"
              aria-label="Loading"
            >...</span>
            <!-- Use compact format for large numbers -->
            <template v-else-if="metric.value >= 10000">
              <span :aria-label="`${metric.value.toLocaleString()} ${metric.label}`">
                {{ formatCompact(metric.value) }}
              </span>
            </template>
            <NumberTicker
              v-else
              :value="metric.value"
              :duration="1500"
              :aria-label="`${metric.value} ${metric.label}`"
            />
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/stats"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-600 dark:bg-primary-500/10 border border-primary-600/20 dark:border-primary-500/30 text-sm font-bold text-white dark:text-primary-400 hover:bg-primary-700 dark:hover:bg-primary-500/20 hover:scale-[1.02] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 outline-none"
        >
          View Full Dashboard
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
