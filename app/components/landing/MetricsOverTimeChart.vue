<script setup lang="ts">
interface Snapshot {
  date: string
  npm: { totalDownloads: number, dailyDownloads?: number, packageCount: number }
  github: {
    stars: number
    followers: number
    contributions?: number
    dailyContributions?: number
    commits?: number
    dailyCommits?: number
  }
  devto: {
    views: number
    dailyViews?: number
    followers: number
    dailyFollowers?: number
    reactions: number
    dailyReactions?: number
    comments: number
    dailyComments?: number
    articles?: number
  }
  ecosystem?: {
    packages: number
    plugins: number
    rules: number
  }
}

interface Props {
  loading?: boolean
}

defineProps<Props>()

// URL-based state management for deep links
const route = useRoute()
const router = useRouter()

const history = ref<Snapshot[]>([])
const historyLoading = ref(true)

// Read initial values from URL or default
const selectedMetric = ref<string>((route.query.metric as string) || 'downloads')
const cumulativeGranularity = ref<'weekly' | 'monthly'>(
  (route.query.cumulative as 'weekly' | 'monthly') || 'weekly'
)
const periodGranularity = ref<'daily' | 'weekly' | 'monthly'>(
  (route.query.period as 'daily' | 'weekly' | 'monthly') || 'weekly'
)

// Sync changes to URL
watch([selectedMetric, cumulativeGranularity, periodGranularity], ([metric, cumulative, period]) => {
  router.replace({
    query: { ...route.query, metric, cumulative, period }
  })
})

// Fetch historical data
onMounted(async () => {
  try {
    const data = await $fetch<Snapshot[]>('/api/metrics-history')
    history.value = data || []
  } catch (e) {
    console.error('Failed to fetch metrics history:', e)
    history.value = []
  } finally {
    historyLoading.value = false
  }
})

// All available metrics with categories
const metricOptions = [
  // Exposure (most commonly growing metrics first)
  {
    key: 'downloads',
    label: '📦 NPM Downloads',
    shortLabel: 'Downloads',
    color: 'from-primary-500 to-primary-400',
    bgColor: 'bg-primary-500',
    category: 'Exposure',
    description: 'Package adoption and usage'
  },
  {
    key: 'views',
    label: '👁️ Total Views',
    shortLabel: 'Views',
    color: 'from-cyan-500 to-cyan-400',
    bgColor: 'bg-cyan-500',
    category: 'Exposure',
    description: 'Article page views on Dev.to'
  },
  // Effort (Leading Indicators)
  {
    key: 'contributions',
    label: '🔨 Contributions',
    shortLabel: 'Contributions',
    color: 'from-orange-500 to-orange-400',
    bgColor: 'bg-orange-500',
    category: 'Effort',
    description: 'Total GitHub activity (commits, PRs, issues, reviews)'
  },
  {
    key: 'commits',
    label: '✅ Commits',
    shortLabel: 'Commits',
    color: 'from-teal-500 to-teal-400',
    bgColor: 'bg-teal-500',
    category: 'Effort',
    description: 'Code commits this year'
  },
  // North Star
  {
    key: 'stars',
    label: '⭐ GitHub Stars',
    shortLabel: 'Stars',
    color: 'from-yellow-500 to-orange-400',
    bgColor: 'bg-yellow-500',
    category: 'North Star',
    description: 'Peer-recognized technical value'
  },
  // Followers
  {
    key: 'followers',
    label: '👥 Followers',
    shortLabel: 'Followers',
    color: 'from-purple-500 to-purple-400',
    bgColor: 'bg-purple-500',
    category: 'Followers',
    description: 'Combined GitHub + Dev.to followers'
  },
  // Engagement
  {
    key: 'reactions',
    label: '💬 Reactions',
    shortLabel: 'Reactions',
    color: 'from-red-500 to-red-400',
    bgColor: 'bg-red-500',
    category: 'Engagement',
    description: 'Dev.to likes and reactions'
  },
  {
    key: 'comments',
    label: '💭 Comments',
    shortLabel: 'Comments',
    color: 'from-blue-500 to-blue-400',
    bgColor: 'bg-blue-500',
    category: 'Engagement',
    description: 'Community discussion'
  },
  // Content
  {
    key: 'articles',
    label: '📝 Articles',
    shortLabel: 'Articles',
    color: 'from-green-500 to-green-400',
    bgColor: 'bg-green-500',
    category: 'Content',
    description: 'Technical articles published'
  },
  // Ecosystem
  {
    key: 'packages',
    label: '🔧 Packages',
    shortLabel: 'Packages',
    color: 'from-indigo-500 to-indigo-400',
    bgColor: 'bg-indigo-500',
    category: 'Ecosystem',
    description: 'npm packages published'
  },
  {
    key: 'rules',
    label: '🛡️ Rules',
    shortLabel: 'Rules',
    color: 'from-emerald-500 to-emerald-400',
    bgColor: 'bg-emerald-500',
    category: 'Ecosystem',
    description: 'ESLint security rules'
  }
]

// Period granularity options
const periodOptions = [
  { key: 'daily' as const, label: 'Daily' },
  { key: 'weekly' as const, label: 'Weekly' },
  { key: 'monthly' as const, label: 'Monthly' }
]

// Get current metric config - guaranteed to exist
const currentMetric = computed(() => {
  const found = metricOptions.find(m => m.key === selectedMetric.value)
  return found ?? metricOptions[0]!
})

// Extract raw value for a metric from a snapshot
const getMetricValue = (snapshot: Snapshot, metric: string): number => {
  switch (metric) {
    case 'stars':
      return snapshot.github.stars
    case 'contributions':
      return snapshot.github.contributions ?? 0
    case 'commits':
      return snapshot.github.commits ?? 0
    case 'downloads':
      return snapshot.npm.totalDownloads
    case 'views':
      return snapshot.devto.views
    case 'followers':
      return snapshot.github.followers + snapshot.devto.followers
    case 'reactions':
      return snapshot.devto.reactions
    case 'comments':
      return snapshot.devto.comments
    case 'articles':
      return snapshot.devto.articles ?? 0
    case 'packages':
      return snapshot.npm.packageCount
    case 'rules':
      return snapshot.ecosystem?.rules ?? 216
    default:
      return 0
  }
}

// Get ISO week number and date range
const getWeekNumber = (date: Date): string => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

// Get week start date from week key
const getWeekStartDate = (weekKey: string): Date => {
  const [year, week] = weekKey.split('-W').map(Number)
  const jan4 = new Date(Date.UTC(year!, 0, 4))
  const weekStart = new Date(jan4)
  weekStart.setUTCDate(jan4.getUTCDate() - (jan4.getUTCDay() || 7) + 1 + (week! - 1) * 7)
  return weekStart
}

// Format week range for display
const formatWeekRange = (weekKey: string): string => {
  const start = getWeekStartDate(weekKey)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)

  const formatDate = (d: Date) => {
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    const day = d.getUTCDate()
    return `${month} ${day}`
  }

  return `${formatDate(start)} - ${formatDate(end)}`
}

// Get month key
const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Format month for display
const formatMonth = (monthKey: string): string => {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// ============================================
// CUMULATIVE DATA (always growing over time)
// ============================================
const cumulativeData = computed(() => {
  const rawData = history.value.map(snapshot => ({
    date: snapshot.date,
    value: getMetricValue(snapshot, selectedMetric.value)
  }))

  if (rawData.length === 0) return []

  // Group by granularity and show last value of each period
  if (cumulativeGranularity.value === 'weekly') {
    const weekMap: Record<string, { value: number, date: string }> = {}

    rawData.forEach((d) => {
      const weekKey = getWeekNumber(new Date(d.date))
      if (!weekMap[weekKey] || d.date > weekMap[weekKey]!.date) {
        weekMap[weekKey] = { value: d.value, date: d.date }
      }
    })

    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekLabel, data]) => ({
        date: weekLabel,
        value: data.value
      }))
  } else {
    // Monthly
    const monthMap: Record<string, { value: number, date: string }> = {}

    rawData.forEach((d) => {
      const monthKey = getMonthKey(new Date(d.date))
      if (!monthMap[monthKey] || d.date > monthMap[monthKey]!.date) {
        monthMap[monthKey] = { value: d.value, date: d.date }
      }
    })

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthLabel, data]) => ({
        date: monthLabel,
        value: data.value
      }))
  }
})

// ============================================
// DELTA DATA (varies over time periods)
// ============================================
const deltaData = computed(() => {
  const rawData = history.value
    .map(snapshot => ({
      date: snapshot.date,
      value: getMetricValue(snapshot, selectedMetric.value)
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (rawData.length < 2) return []

  // Calculate deltas between consecutive snapshots
  const deltas: { date: string, value: number }[] = []

  for (let i = 1; i < rawData.length; i++) {
    const delta = Math.max(0, rawData[i]!.value - rawData[i - 1]!.value)
    deltas.push({ date: rawData[i]!.date, value: delta })
  }

  // Group based on granularity
  switch (periodGranularity.value) {
    case 'daily': {
      return deltas
    }

    case 'weekly': {
      const weekMap: Record<string, number> = {}
      deltas.forEach((d) => {
        const weekKey = getWeekNumber(new Date(d.date))
        weekMap[weekKey] = (weekMap[weekKey] || 0) + d.value
      })
      return Object.entries(weekMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ date: label, value }))
    }

    case 'monthly': {
      const monthMap: Record<string, number> = {}
      deltas.forEach((d) => {
        const monthKey = getMonthKey(new Date(d.date))
        monthMap[monthKey] = (monthMap[monthKey] || 0) + d.value
      })
      return Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ date: label, value }))
    }

    default:
      return deltas
  }
})

// Get max values for scaling
const cumulativeMax = computed(() =>
  Math.max(...cumulativeData.value.map(d => d.value), 1)
)

const deltaMax = computed(() =>
  Math.max(...deltaData.value.map(d => d.value), 1)
)

// Format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Calculate total growth percentage
const totalGrowth = computed(() => {
  if (cumulativeData.value.length < 2) return null
  const first = cumulativeData.value[0]?.value ?? 0
  const last = cumulativeData.value[cumulativeData.value.length - 1]?.value ?? 0
  if (first === 0) return last > 0 ? '+∞' : null
  return ((last - first) / first * 100).toFixed(0)
})

// Calculate total delta sum for the period
const totalDeltaSum = computed(() => {
  return deltaData.value.reduce((sum, d) => sum + d.value, 0)
})

// Group metrics by category for the selector
const groupedMetrics = computed(() => {
  const groups: Record<string, typeof metricOptions> = {}
  metricOptions.forEach((m) => {
    if (!groups[m.category]) groups[m.category] = []
    groups[m.category]!.push(m)
  })
  return groups
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-4">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-line-chart"
              class="w-5 h-5 text-primary-500"
            />
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Metrics Over Time
            </h3>
          </div>
        </div>

        <!-- Metric Selector - Grouped by Category -->
        <div class="flex flex-wrap gap-1.5">
          <template
            v-for="(metrics, category) in groupedMetrics"
            :key="category"
          >
            <div class="flex items-center gap-1">
              <span
                class="text-[10px] text-gray-400 dark:text-gray-500 px-1 hidden sm:inline"
              >{{ category }}:</span>
              <button
                v-for="metric in metrics"
                :key="metric.key"
                :title="metric.description"
                :class="[
                  'px-2 py-1 text-xs rounded-md transition-all',
                  selectedMetric === metric.key
                    ? 'bg-linear-to-r text-white ' + metric.color
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
                @click="selectedMetric = metric.key"
              >
                {{ metric.shortLabel }}
              </button>
            </div>
            <div
              class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 self-center hidden sm:block"
            />
          </template>
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <div
      v-if="historyLoading"
      class="h-80 flex items-center justify-center"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-primary-500"
      />
    </div>

    <!-- No Data State -->
    <div
      v-else-if="history.length === 0"
      class="h-80 flex flex-col items-center justify-center text-gray-500"
    >
      <UIcon
        name="i-lucide-calendar-x"
        class="w-12 h-12 mb-2 opacity-50"
      />
      <p class="text-sm">
        No historical data yet
      </p>
      <p class="text-xs mt-1">
        Snapshots will be captured daily
      </p>
    </div>

    <!-- Two Charts: Cumulative + Delta -->
    <div
      v-else
      class="space-y-8"
    >
      <!-- ===== CUMULATIVE GROWTH CHART ===== -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-trending-up"
              class="w-4 h-4 text-green-500"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cumulative Growth
            </span>
            <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              Total {{ currentMetric.shortLabel.toLowerCase() }} over time
            </span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Growth percentage -->
            <div
              v-if="totalGrowth !== null"
              class="flex items-center gap-2"
            >
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                ]"
              >
                {{ totalGrowth === '+∞' ? '+∞' : `+${totalGrowth}%` }}
              </span>
            </div>

            <!-- Cumulative Granularity Toggle -->
            <div class="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
              <button
                :class="[
                  'px-2 py-1 transition-colors',
                  cumulativeGranularity === 'weekly'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
                @click="cumulativeGranularity = 'weekly'"
              >
                Weekly
              </button>
              <button
                :class="[
                  'px-2 py-1 transition-colors',
                  cumulativeGranularity === 'monthly'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
                @click="cumulativeGranularity = 'monthly'"
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <!-- Cumulative Bar Chart -->
        <div class="h-32 flex items-end gap-1 px-2">
          <div
            v-for="(point, index) in cumulativeData"
            :key="point.date"
            class="relative flex-1 h-full group flex items-end"
          >
            <div
              class="w-full rounded-t transition-all duration-300 bg-linear-to-t cursor-pointer shadow-sm hover:shadow-md group-hover:scale-105 origin-bottom"
              :class="currentMetric.color"
              :style="{
                height: `${Math.max(8, (point.value / cumulativeMax) * 100)}%`,
                transitionDelay: `${index * 30}ms`
              }"
            />
            <!-- Enhanced Tooltip -->
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 pointer-events-none"
            >
              <div
                class="bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-sm text-white dark:text-gray-900 px-3 py-2.5 rounded-lg shadow-xl border border-gray-700 dark:border-gray-300 text-xs whitespace-nowrap"
              >
                <div class="font-semibold text-gray-100 dark:text-gray-800 mb-1">
                  {{ cumulativeGranularity === 'weekly' ? formatWeekRange(point.date) : formatMonth(point.date) }}
                </div>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-[10px] text-gray-400 dark:text-gray-600">Total:</span>
                  <span
                    class="font-bold text-sm"
                    :class="currentMetric.color.replace('from-', 'text-').replace('to-primary-400', '').replace('to-cyan-400', '').replace('to-orange-400', '').replace('to-teal-400', '').replace('to-purple-400', '').replace('to-red-400', '').replace('to-blue-400', '').replace('to-green-400', '').replace('to-indigo-400', '').replace('to-emerald-400', '')"
                  >
                    {{ formatNumber(point.value) }}
                  </span>
                </div>
              </div>
              <!-- Tooltip arrow -->
              <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div class="w-2 h-2 bg-gray-900/95 dark:bg-gray-100/95 rotate-45 border-r border-b border-gray-700 dark:border-gray-300" />
              </div>
            </div>
          </div>
        </div>

        <!-- X-Axis Labels -->
        <div class="flex justify-between text-[10px] text-gray-400 mt-2 px-2">
          <span>{{ cumulativeData[0]?.date }}</span>
          <span>{{ cumulativeData[cumulativeData.length - 1]?.date }}</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-200 dark:border-gray-700" />

      <!-- ===== PERIOD ACTIVITY CHART ===== -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-bar-chart-3"
              class="w-4 h-4 text-blue-500"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Period Activity
            </span>
            <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              New {{ currentMetric.shortLabel.toLowerCase() }} per {{ periodGranularity }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Period total -->
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Total: <span class="font-medium text-gray-700 dark:text-gray-300">+{{ formatNumber(totalDeltaSum) }}</span>
            </span>

            <!-- Period Granularity Toggle -->
            <div class="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
              <button
                v-for="opt in periodOptions"
                :key="opt.key"
                :class="[
                  'px-2 py-1 transition-colors',
                  periodGranularity === opt.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
                @click="periodGranularity = opt.key"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Delta Bar Chart -->
        <div
          v-if="deltaData.length > 0"
          class="h-28 flex items-end gap-1 px-2"
        >
          <div
            v-for="(point, index) in deltaData"
            :key="point.date"
            class="relative flex-1 h-full group flex items-end"
          >
            <div
              class="w-full rounded-t transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md group-hover:scale-105 origin-bottom"
              :class="[
                point.value > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              :style="{
                height: `${Math.max(4, (point.value / deltaMax) * 100)}%`,
                transitionDelay: `${index * 30}ms`
              }"
            />
            <!-- Enhanced Tooltip -->
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 pointer-events-none"
            >
              <div
                class="bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-sm text-white dark:text-gray-900 px-3 py-2.5 rounded-lg shadow-xl border border-gray-700 dark:border-gray-300 text-xs whitespace-nowrap"
              >
                <div class="font-semibold text-gray-100 dark:text-gray-800 mb-1">
                  {{ periodGranularity === 'daily' ? point.date : (periodGranularity === 'weekly' ? formatWeekRange(point.date) : formatMonth(point.date)) }}
                </div>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-[10px] text-gray-400 dark:text-gray-600">New:</span>
                  <span class="font-bold text-sm text-blue-400 dark:text-blue-600">
                    +{{ formatNumber(point.value) }}
                  </span>
                </div>
              </div>
              <!-- Tooltip arrow -->
              <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div class="w-2 h-2 bg-gray-900/95 dark:bg-gray-100/95 rotate-45 border-r border-b border-gray-700 dark:border-gray-300" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state for deltas -->
        <div
          v-else
          class="h-28 flex items-center justify-center text-gray-400 text-sm"
        >
          Need more data points to show activity
        </div>

        <!-- X-Axis Labels -->
        <div
          v-if="deltaData.length > 0"
          class="flex justify-between text-[10px] text-gray-400 mt-2 px-2"
        >
          <span>{{ deltaData[0]?.date }}</span>
          <span>{{ deltaData[deltaData.length - 1]?.date }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
        Snapshots captured daily via GitHub Actions •
        <span class="font-medium">{{ history.length }}</span> data points
      </div>
    </template>
  </UCard>
</template>
