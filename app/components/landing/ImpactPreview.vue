<script setup lang="ts">
/**
 * ImpactPreview - Impressive metrics showcase for home page
 * Shows key metrics in a wide horizontal layout
 */

const {
  stats: githubStats,
  loading: ghLoading,
  fetchStats: fetchGitHub
} = useGitHubStats()
const {
  totalDownloads,
  packageCount,
  loading: npmLoading,
  fetchStats: fetchNpm
} = useNpmStats()
const {
  totalViews,
  followers: devtoFollowers,
  loading: devtoLoading,
  fetchArticles
} = useDevToArticles()

onMounted(() => {
  fetchGitHub()
  fetchNpm()
  fetchArticles('ofri-peretz', 100)
})

const loading = computed(
  () => ghLoading.value || npmLoading.value || devtoLoading.value
)

// Computed metrics for display - 6 key metrics with short labels
const metrics = computed(() => [
  {
    label: 'Views',
    value: totalViews.value,
    icon: 'i-lucide-eye',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  {
    label: 'Downloads',
    value: totalDownloads.value,
    icon: 'i-simple-icons-npm',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  {
    label: 'Followers',
    value: (githubStats.value?.followers || 0) + (devtoFollowers.value || 0),
    icon: 'i-lucide-users',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    label: 'Plugins',
    value: packageCount.value,
    icon: 'i-lucide-shield-check',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    label: 'Commits',
    value: githubStats.value?.recentCommits || 0,
    icon: 'i-lucide-git-commit',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    label: 'Repos',
    value: githubStats.value?.totalRepos || 0,
    icon: 'i-lucide-folder-git-2',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  }
])

// Format large numbers
const _formatNumber = (n: number) => {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`
  if (n >= 1000) return n.toLocaleString()
  return n.toString()
}
</script>

<template>
  <div
    class="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl"
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
            class="w-4 h-4 text-primary-400"
          />
          <span
            class="text-xs font-semibold tracking-wider text-primary-400 uppercase"
          >
            Open Source Impact
          </span>
        </div>
      </div>

      <!-- Metrics Grid - 2 cols on mobile, 3 on tablet+ -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="relative p-4 sm:p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          :class="[metric.bgColor, metric.borderColor]"
        >
          <!-- Icon and Label -->
          <div class="flex items-center gap-2 mb-3">
            <div
              class="p-1.5 rounded-lg"
              :class="metric.bgColor"
            >
              <UIcon
                :name="metric.icon"
                class="w-4 h-4"
                :class="metric.color"
              />
            </div>
            <span class="text-sm font-medium text-gray-300">{{
              metric.label
            }}</span>
          </div>
          <!-- Value -->
          <div
            class="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight"
            :class="metric.color"
          >
            <span
              v-if="loading"
              class="animate-pulse text-lg"
            >...</span>
            <NumberTicker
              v-else
              :value="metric.value"
              :duration="1500"
            />
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/stats"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-sm font-medium text-primary-400 hover:bg-primary-500/20 hover:border-primary-500/50 transition-all duration-300"
        >
          View Full Dashboard
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
