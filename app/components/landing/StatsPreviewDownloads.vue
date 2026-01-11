<script setup lang="ts">
/**
 * StatsPreviewDownloads - Interactive npm downloads preview for projects page
 * Features sparkline chart and hoverable package cards
 */

const { stats: npmStats, loading, totalDownloads, fetchStats } = useNpmStats()

onMounted(() => {
  fetchStats()
})

// Top 3 packages
const topPackages = computed(() => {
  if (!npmStats.value || !Array.isArray(npmStats.value)) return []
  return npmStats.value.slice(0, 4).map(pkg => ({
    name: pkg.name || 'Unknown',
    downloads: pkg.downloads || 0
  }))
})

// Max downloads for relative bar sizing
const maxDownloads = computed(() => {
  return Math.max(...topPackages.value.map(p => p.downloads), 1)
})

// Sparkline data - aggregate last 7 days of downloads
const sparklineData = computed(() => {
  if (!npmStats.value || !Array.isArray(npmStats.value)) return []

  const dayMap: Record<string, number> = {}

  npmStats.value.forEach((pkg) => {
    pkg.dailyData
      ?.slice(-7)
      .forEach((d: { day: string, downloads: number }) => {
        dayMap[d.day] = (dayMap[d.day] || 0) + d.downloads
      })
  })

  const sortedDays = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)

  return sortedDays.map(([, downloads]) => downloads)
})

// Calculate sparkline path
const sparklinePath = computed(() => {
  if (sparklineData.value.length < 2) return ''

  const data = sparklineData.value
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const range = max - min || 1

  const width = 100
  const height = 30
  const padding = 2

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  return `M ${points.join(' L ')}`
})

// Sparkline gradient fill path
const sparklineFillPath = computed(() => {
  if (sparklineData.value.length < 2) return ''

  const path = sparklinePath.value
  if (!path) return ''

  const data = sparklineData.value
  const width = 100
  const height = 30
  const padding = 2

  const lastX
    = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)
  const firstX = padding

  return `${path} L ${lastX},${height - padding} L ${firstX},${height - padding} Z`
})

// Hover state
const hoveredPackage = ref<string | null>(null)

// Format number
const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Animated bar widths
const animatedBars = ref(false)
onMounted(() => {
  setTimeout(() => {
    animatedBars.value = true
  }, 200)
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-primary-500/30 bg-linear-to-br from-primary-500/5 via-primary-600/5 to-primary-700/5 dark:from-primary-900/20 dark:via-primary-800/20 dark:to-primary-700/20 p-6"
  >
    <!-- Background glow -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
    />

    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-center justify-center gap-2 mb-3">
        <UIcon
          name="i-simple-icons-npm"
          class="w-4 h-4 text-red-500"
        />
        <span
          class="text-xs font-medium tracking-wider text-primary-600 dark:text-primary-400 uppercase"
        >
          Package Downloads
        </span>
      </div>

      <!-- Total Downloads -->
      <div class="text-center mb-4">
        <div
          class="text-4xl font-bold tabular-nums bg-clip-text text-transparent bg-linear-to-r from-primary-500 to-primary-600"
        >
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
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Total Downloads
        </div>
      </div>

      <!-- Mini Sparkline Chart -->
      <div
        v-if="sparklineData.length >= 2"
        class="mb-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3"
      >
        <div
          class="flex items-center justify-between text-xs text-gray-500 mb-2"
        >
          <span>7-Day Trend</span>
          <span class="flex items-center gap-1 text-green-500">
            <UIcon
              name="i-lucide-trending-up"
              class="w-3 h-3"
            />
            Active
          </span>
        </div>
        <svg
          viewBox="0 0 100 30"
          class="w-full h-10"
        >
          <!-- Gradient definition -->
          <defs>
            <linearGradient
              id="sparkGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style="
                  stop-color: rgb(var(--color-primary-500));
                  stop-opacity: 0.3;
                "
              />
              <stop
                offset="100%"
                style="
                  stop-color: rgb(var(--color-primary-500));
                  stop-opacity: 0;
                "
              />
            </linearGradient>
          </defs>
          <!-- Fill area -->
          <path
            :d="sparklineFillPath"
            fill="url(#sparkGradient)"
            class="transition-all duration-500"
          />
          <!-- Line -->
          <path
            :d="sparklinePath"
            fill="none"
            stroke="rgb(var(--color-primary-500))"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-all duration-500"
          />
        </svg>
      </div>

      <!-- Top Packages with hover effect -->
      <div
        v-if="topPackages.length > 0"
        class="space-y-2 mb-5"
      >
        <div
          v-for="(pkg, idx) in topPackages"
          :key="pkg.name"
          class="group flex items-center gap-2 p-2 -mx-2 rounded-lg cursor-pointer transition-all duration-200"
          :class="
            hoveredPackage === pkg.name
              ? 'bg-primary-500/10 scale-[1.02]'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
          "
          @mouseenter="hoveredPackage = pkg.name"
          @mouseleave="hoveredPackage = null"
        >
          <!-- Rank badge -->
          <div
            class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            :class="
              idx === 0
                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                : idx === 1
                  ? 'bg-gray-300/30 text-gray-500'
                  : idx === 2
                    ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-200/50 text-gray-400 dark:bg-gray-700/50'
            "
          >
            {{ idx + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div
              class="text-xs text-gray-600 dark:text-gray-400 truncate font-medium"
            >
              {{ pkg.name }}
            </div>
            <div
              class="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1"
            >
              <div
                class="h-full bg-linear-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-700 ease-out"
                :style="{
                  width: animatedBars
                    ? `${(pkg.downloads / maxDownloads) * 100}%`
                    : '0%',
                  transitionDelay: `${idx * 100}ms`
                }"
              />
            </div>
          </div>
          <span
            class="text-xs font-bold tabular-nums transition-colors"
            :class="
              hoveredPackage === pkg.name ? 'text-primary-500' : 'text-gray-500'
            "
          >
            {{ formatNumber(pkg.downloads) }}
          </span>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="text-center">
        <NuxtLink to="/stats">
          <ShimmerButton class="mx-auto">
            <span class="flex items-center gap-2 text-sm font-medium">
              <UIcon
                name="i-lucide-bar-chart-3"
                class="w-4 h-4"
              />
              View Full Dashboard
              <UIcon
                name="i-lucide-arrow-right"
                class="w-4 h-4"
              />
            </span>
          </ShimmerButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
