<script setup lang="ts">
/**
 * InterlaceEslintPromo - Promotional widget for Interlace ESLint ecosystem
 * Shows package downloads with colorful bars and links to eslint.interlace.tools
 */

const { stats: npmStats, loading, fetchStats } = useNpmStats()

onMounted(() => {
  fetchStats()
})

// Time period selection
type TimePeriod = '7d' | '30d' | '90d' | 'all'
const timePeriod = ref<TimePeriod>('all')

const periodOptions = [
  { key: '7d' as const, label: '7 Days' },
  { key: '30d' as const, label: '30 Days' },
  { key: '90d' as const, label: '90 Days' },
  { key: 'all' as const, label: 'All Time' }
]

// Start date for metrics
const METRICS_START_DATE = new Date('2025-12-01')

// Get date range based on selection
const getDateRange = (period: TimePeriod): { start: Date, end: Date } => {
  const end = new Date()
  let start: Date

  switch (period) {
    case '7d':
      start = new Date(end)
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start = new Date(end)
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start = new Date(end)
      start.setDate(start.getDate() - 90)
      break
    case 'all':
    default:
      start = METRICS_START_DATE
  }

  if (start < METRICS_START_DATE) {
    start = METRICS_START_DATE
  }

  return { start, end }
}

// Calculate downloads for each package based on time period
const filteredPackages = computed(() => {
  if (!npmStats.value || !Array.isArray(npmStats.value)) return []

  const { start, end } = getDateRange(timePeriod.value)
  const startStr = start.toISOString().split('T')[0] ?? ''
  const endStr = end.toISOString().split('T')[0] ?? ''

  return npmStats.value
    .map((pkg) => {
      if (!pkg.dailyData || pkg.dailyData.length === 0) {
        return { name: pkg.name, downloads: pkg.downloads }
      }

      const filteredDownloads = pkg.dailyData
        .filter((d: { day: string, downloads: number }) => d.day >= startStr && d.day <= endStr)
        .reduce((sum: number, d: { day: string, downloads: number }) => sum + d.downloads, 0)

      return {
        name: pkg.name,
        downloads: timePeriod.value === 'all' ? pkg.downloads : filteredDownloads
      }
    })
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 6)
})

// Get max downloads for scaling
const maxDownloads = computed(() =>
  Math.max(...filteredPackages.value.map(p => p.downloads), 1)
)

// Total downloads
const totalDownloads = computed(() =>
  filteredPackages.value.reduce((sum, p) => sum + p.downloads, 0)
)

// Format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Get color for package rank
const getPackageColor = (index: number) => {
  const colors = [
    'from-indigo-500 to-indigo-400',
    'from-green-500 to-green-400',
    'from-blue-500 to-blue-400',
    'from-purple-500 to-purple-400',
    'from-orange-500 to-orange-400',
    'from-pink-500 to-pink-400'
  ]
  return colors[index] || 'from-gray-500 to-gray-400'
}

// Period label
const periodLabel = computed(() => {
  const { start } = getDateRange(timePeriod.value)
  if (timePeriod.value === 'all') {
    return `Since ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return periodOptions.find(o => o.key === timePeriod.value)?.label || ''
})
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-primary-500/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
    <!-- Background glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

    <div class="relative z-10 p-6">
      <!-- Header with branding -->
      <div class="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <UIcon
              name="i-lucide-shield-check"
              class="w-5 h-5 text-primary-500"
            />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white">
              Interlace ESLint Ecosystem
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ periodLabel }}
            </p>
          </div>
        </div>

        <!-- Time Period Toggle -->
        <div class="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
          <button
            v-for="period in periodOptions"
            :key="period.key"
            :class="[
              'px-2.5 py-1.5 transition-colors font-medium',
              timePeriod === period.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            @click="timePeriod = period.key"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Total Downloads Hero -->
      <div class="text-center mb-6 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="text-4xl font-bold tabular-nums bg-clip-text text-transparent bg-linear-to-r from-primary-500 to-primary-600">
          <span
            v-if="loading"
            class="animate-pulse"
          >...</span>
          <NumberTicker
            v-else
            :value="totalDownloads"
            :duration="2000"
          />
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
          Total Downloads
        </div>
      </div>

      <!-- Package List -->
      <div
        v-if="loading"
        class="h-48 flex items-center justify-center"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>

      <div
        v-else
        class="space-y-3 mb-6"
      >
        <div
          v-for="(pkg, index) in filteredPackages"
          :key="pkg.name"
          class="group"
        >
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-700 dark:text-gray-300 truncate text-xs">
              {{ pkg.name }}
            </span>
            <span class="text-gray-500 dark:text-gray-400 font-mono text-xs tabular-nums">
              {{ formatNumber(pkg.downloads) }}
            </span>
          </div>
          <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-1000 ease-out bg-linear-to-r"
              :class="getPackageColor(index)"
              :style="{ width: `${(pkg.downloads / maxDownloads) * 100}%` }"
            />
          </div>
        </div>
      </div>

      <!-- CTA Button - Matching app style -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <NuxtLink
          to="https://eslint.interlace.tools"
          target="_blank"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 dark:bg-primary-500/10 border border-primary-600/20 dark:border-primary-500/30 text-sm font-bold text-white dark:text-primary-400 hover:bg-primary-700 dark:hover:bg-primary-500/20 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary-500/10"
        >
          <UIcon
            name="i-lucide-book-open"
            class="w-4 h-4"
          />
          Explore Documentation
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4"
          />
        </NuxtLink>

        <NuxtLink
          to="/stats"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <UIcon
            name="i-lucide-bar-chart-3"
            class="w-4 h-4"
          />
          View Full Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
