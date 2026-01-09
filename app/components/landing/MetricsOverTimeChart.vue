<script setup lang="ts">
interface Snapshot {
  date: string
  npm: { totalDownloads: number, packageCount: number }
  github: {
    stars: number
    followers: number
    contributions?: number
    commits?: number
  }
  devto: {
    views: number
    followers: number
    reactions: number
    comments: number
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
const selectedMetric = ref<string>((route.query.metric as string) || 'stars')
const timeAggregation = ref<'daily' | 'weekly' | 'monthly' | 'cumulative'>(
  (route.query.agg as 'daily' | 'weekly' | 'monthly' | 'cumulative')
  || 'weekly'
)

// Sync changes to URL
watch([selectedMetric, timeAggregation], ([metric, agg]) => {
  router.replace({
    query: { ...route.query, metric, agg }
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
  // North Star
  {
    key: 'stars',
    label: '⭐ GitHub Stars',
    shortLabel: 'Stars',
    color: 'from-yellow-500 to-orange-400',
    category: 'North Star',
    description: 'Peer-recognized technical value'
  },
  // Effort (Leading Indicators)
  {
    key: 'contributions',
    label: '🔨 Contributions',
    shortLabel: 'Contributions',
    color: 'from-orange-500 to-orange-400',
    category: 'Effort',
    description: 'Total GitHub activity (commits, PRs, issues, reviews)'
  },
  {
    key: 'commits',
    label: '✅ Commits',
    shortLabel: 'Commits',
    color: 'from-teal-500 to-teal-400',
    category: 'Effort',
    description: 'Code commits this year'
  },
  // Exposure
  {
    key: 'downloads',
    label: '📦 NPM Downloads',
    shortLabel: 'Downloads',
    color: 'from-primary-500 to-primary-400',
    category: 'Exposure',
    description: 'Package adoption and usage'
  },
  {
    key: 'views',
    label: '👁️ Total Views',
    shortLabel: 'Views',
    color: 'from-cyan-500 to-cyan-400',
    category: 'Exposure',
    description: 'Article page views on Dev.to'
  },
  {
    key: 'followers',
    label: '👥 Followers',
    shortLabel: 'Followers',
    color: 'from-purple-500 to-purple-400',
    category: 'Followers',
    description: 'Combined GitHub + Dev.to followers'
  },
  // Engagement
  {
    key: 'reactions',
    label: '💬 Reactions',
    shortLabel: 'Reactions',
    color: 'from-red-500 to-red-400',
    category: 'Engagement',
    description: 'Dev.to likes and reactions'
  },
  {
    key: 'comments',
    label: '💭 Comments',
    shortLabel: 'Comments',
    color: 'from-blue-500 to-blue-400',
    category: 'Engagement',
    description: 'Community discussion'
  },
  // Content
  {
    key: 'articles',
    label: '📝 Articles',
    shortLabel: 'Articles',
    color: 'from-green-500 to-green-400',
    category: 'Content',
    description: 'Technical articles published'
  },
  {
    key: 'packages',
    label: '🔧 Packages',
    shortLabel: 'Packages',
    color: 'from-indigo-500 to-indigo-400',
    category: 'Ecosystem',
    description: 'npm packages published'
  },
  {
    key: 'rules',
    label: '🛡️ Rules',
    shortLabel: 'Rules',
    color: 'from-emerald-500 to-emerald-400',
    category: 'Ecosystem',
    description: 'ESLint security rules'
  }
]

// Time aggregation options
const aggregationOptions = [
  { key: 'daily' as const, label: 'Daily' },
  { key: 'weekly' as const, label: 'Weekly' },
  { key: 'monthly' as const, label: 'Monthly' },
  { key: 'cumulative' as const, label: 'Cumulative' }
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

// Get ISO week number
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

// Get month key
const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Aggregate data based on time selection
const aggregatedData = computed(() => {
  const rawData = history.value.map(snapshot => ({
    date: snapshot.date,
    value: getMetricValue(snapshot, selectedMetric.value)
  }))

  if (rawData.length === 0) return []

  switch (timeAggregation.value) {
    case 'daily':
      // Show the actual value recorded each day
      return rawData

    case 'weekly': {
      // Group by week, show the last (most recent) value of each week
      const weekMap: Record<string, { date: string, value: number }> = {}
      rawData.forEach((d) => {
        const weekKey = getWeekNumber(new Date(d.date))
        // Keep the latest value for each week
        if (!weekMap[weekKey] || d.date > weekMap[weekKey]!.date) {
          weekMap[weekKey] = { date: d.date, value: d.value }
        }
      })
      return Object.entries(weekMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekLabel, data]) => ({
          date: weekLabel,
          value: data.value
        }))
    }

    case 'monthly': {
      // Group by month, show the last (most recent) value of each month
      const monthMap: Record<string, { date: string, value: number }> = {}
      rawData.forEach((d) => {
        const monthKey = getMonthKey(new Date(d.date))
        // Keep the latest value for each month
        if (!monthMap[monthKey] || d.date > monthMap[monthKey]!.date) {
          monthMap[monthKey] = { date: d.date, value: d.value }
        }
      })
      return Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthLabel, data]) => ({
          date: monthLabel,
          value: data.value
        }))
    }

    case 'cumulative':
      // Show the absolute values over time (same as daily, but semantically "total so far")
      return rawData

    default:
      return rawData
  }
})


// Get max value for scaling
const maxValue = computed(() =>
  Math.max(...aggregatedData.value.map(d => d.value), 1)
)

// Format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Calculate growth
const growth = computed(() => {
  if (aggregatedData.value.length < 2) return null
  const first = aggregatedData.value[0]?.value ?? 0
  const last
    = aggregatedData.value[aggregatedData.value.length - 1]?.value ?? 0
  if (first === 0) return null
  return (((last - first) / first) * 100).toFixed(1)
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

          <!-- Time Aggregation Toggle - scrollable on mobile -->
          <div
            class="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs scrollbar-hide"
          >
            <button
              v-for="agg in aggregationOptions"
              :key="agg.key"
              :class="[
                'px-3 py-1.5 transition-colors',
                timeAggregation === agg.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
              @click="timeAggregation = agg.key"
            >
              {{ agg.label }}
            </button>
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
      class="h-48 flex items-center justify-center"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-primary-500"
      />
    </div>

    <!-- No Data State -->
    <div
      v-else-if="aggregatedData.length === 0"
      class="h-48 flex flex-col items-center justify-center text-gray-500"
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

    <!-- Chart -->
    <div v-else>
      <!-- Metric Info & Growth Badge -->
      <div class="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
            currentMetric.label
          }}</span>
          <span
            class="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline"
          >{{ currentMetric.description }}</span>
        </div>
        <div
          v-if="growth"
          class="flex items-center gap-2"
        >
          <span class="text-xs text-gray-500 dark:text-gray-400">Growth:</span>
          <span
            :class="[
              'px-2 py-0.5 rounded-full text-xs font-medium',
              parseFloat(growth) >= 0
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            ]"
          >
            {{ parseFloat(growth) >= 0 ? "+" : "" }}{{ growth }}%
          </span>
        </div>
      </div>

      <!-- Bar Chart -->
      <div class="h-40 flex items-end gap-1 px-2">
        <div
          v-for="(point, index) in aggregatedData"
          :key="point.date"
          class="relative flex-1 h-full group flex items-end"
        >
          <div
            class="w-full rounded-t transition-all duration-500 bg-linear-to-t cursor-pointer"
            :class="currentMetric.color"
            :style="{
              height: `${Math.max(8, (point.value / maxValue) * 100)}%`,
              transitionDelay: `${index * 30}ms`
            }"
          />
          <!-- Tooltip -->
          <div
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none"
          >
            <div
              class="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap"
            >
              <div class="font-semibold">
                {{ point.date }}
              </div>
              <div class="text-primary-400 dark:text-primary-600">
                {{ formatNumber(point.value) }}
                {{ currentMetric.shortLabel.toLowerCase() }}
              </div>
              <div class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {{ currentMetric.category }} metric
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- X-Axis Labels -->
      <div class="flex justify-between text-[10px] text-gray-400 mt-2 px-2">
        <span>{{ aggregatedData[0]?.date }}</span>
        <span>{{ aggregatedData[aggregatedData.length - 1]?.date }}</span>
      </div>
    </div>

    <template #footer>
      <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
        Snapshots captured daily via GitHub Actions •
        <span class="font-medium">{{ aggregatedData.length }}</span> data points
      </div>
    </template>
  </UCard>
</template>
