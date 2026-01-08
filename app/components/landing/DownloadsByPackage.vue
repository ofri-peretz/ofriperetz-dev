<script setup lang="ts">
import type { PackageStats } from '~/composables/useNpmStats'

interface Props {
  packages: PackageStats[]
  loading?: boolean
}

const props = defineProps<Props>()

// Time period selection
type TimePeriod = '7d' | '30d' | '90d' | 'all'
const timePeriod = ref<TimePeriod>('all')

const periodOptions = [
  { key: '7d' as const, label: '7 Days' },
  { key: '30d' as const, label: '30 Days' },
  { key: '90d' as const, label: '90 Days' },
  { key: 'all' as const, label: 'All Time' }
]

// Start date for metrics (Dec 1, 2025)
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

  // Ensure we don't go before Dec 1, 2025
  if (start < METRICS_START_DATE) {
    start = METRICS_START_DATE
  }

  return { start, end }
}

// Calculate downloads for each package based on time period
const filteredPackages = computed(() => {
  if (!props.packages || props.packages.length === 0) return []

  const { start, end } = getDateRange(timePeriod.value)
  const startStr = start.toISOString().split('T')[0]
  const endStr = end.toISOString().split('T')[0]

  return props.packages
    .map((pkg) => {
      // If no daily data or "all time", use total downloads
      if (!pkg.dailyData || pkg.dailyData.length === 0) {
        return { name: pkg.name, downloads: pkg.downloads }
      }

      // Filter daily data within date range
      const filteredDownloads = pkg.dailyData
        .filter(d => d.day >= startStr && d.day <= endStr)
        .reduce((sum, d) => sum + d.downloads, 0)

      return {
        name: pkg.name,
        downloads:
          timePeriod.value === 'all' ? pkg.downloads : filteredDownloads
      }
    })
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 8)
})

// Get max downloads for scaling
const maxDownloads = computed(() =>
  Math.max(...filteredPackages.value.map(p => p.downloads), 1)
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
    'from-pink-500 to-pink-400',
    'from-teal-500 to-teal-400',
    'from-red-500 to-red-400'
  ]
  return colors[index] || 'from-gray-500 to-gray-400'
}

// Get period label for subtitle
const periodLabel = computed(() => {
  const { start } = getDateRange(timePeriod.value)
  if (timePeriod.value === 'all') {
    return `Since ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return periodOptions.find(o => o.key === timePeriod.value)?.label || ''
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-bar-chart-2"
            class="w-5 h-5 text-primary-500"
          />
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Downloads by Package
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ periodLabel }}
            </p>
          </div>
        </div>

        <!-- Time Period Toggle -->
        <div
          class="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs"
        >
          <button
            v-for="period in periodOptions"
            :key="period.key"
            :class="[
              'px-3 py-1.5 transition-colors',
              timePeriod === period.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
            @click="timePeriod = period.key"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </template>

    <div
      v-if="loading"
      class="h-64 flex items-center justify-center"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-primary-500"
      />
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="(pkg, index) in filteredPackages"
        :key="pkg.name"
        class="group"
      >
        <div class="flex justify-between text-sm mb-1">
          <NuxtLink
            :to="`https://www.npmjs.com/package/${pkg.name}`"
            target="_blank"
            class="text-gray-700 dark:text-gray-300 truncate text-xs sm:text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ pkg.name }}
          </NuxtLink>
          <span class="text-gray-500 dark:text-gray-400 font-mono text-xs">{{
            formatNumber(pkg.downloads)
          }}</span>
        </div>
        <div
          class="h-2 sm:h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
        >
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out bg-linear-to-r"
            :class="getPackageColor(index)"
            :style="{
              width: `${(pkg.downloads / maxDownloads) * 100}%`
            }"
          />
        </div>
      </div>

      <div
        v-if="filteredPackages.length === 0"
        class="text-center text-gray-500 py-8"
      >
        <UIcon
          name="i-lucide-package-x"
          class="w-12 h-12 mx-auto mb-2 opacity-50"
        />
        <p class="text-sm">
          No download data for this period
        </p>
      </div>
    </div>
  </UCard>
</template>
