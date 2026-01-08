<script setup lang="ts">
interface Snapshot {
  date: string
  npm: { totalDownloads: number }
  github: {
    stars: number
    contributions?: number
    commits?: number
  }
  devto: {
    views: number
    reactions: number
    comments: number
    articles?: number
  }
}

// Fetch historical data
const { data: history, status } = await useFetch<Snapshot[]>(
  '/api/metrics-history'
)

// Define all metrics to correlate with Stars
const metrics = [
  {
    key: 'effort',
    label: 'Effort',
    color: 'orange',
    bgClass: 'bg-orange-400',
    description: 'Commits + Contributions',
    getValue: (s: Snapshot) =>
      (s.github.contributions ?? 0) + (s.github.commits ?? 0)
  },
  {
    key: 'exposure',
    label: 'Exposure',
    color: 'blue',
    bgClass: 'bg-blue-400',
    description: 'Views + Downloads',
    getValue: (s: Snapshot) => s.devto.views + s.npm.totalDownloads
  },
  {
    key: 'engagement',
    label: 'Engagement',
    color: 'purple',
    bgClass: 'bg-purple-400',
    description: 'Reactions + Comments',
    getValue: (s: Snapshot) => s.devto.reactions + s.devto.comments
  },
  {
    key: 'content',
    label: 'Content',
    color: 'green',
    bgClass: 'bg-green-400',
    description: 'Articles Published',
    getValue: (s: Snapshot) => s.devto.articles ?? 0
  }
]

// URL-based state management for deep links
const route = useRoute()
const router = useRouter()

// Selected metric for correlation - read from URL or default
const selectedMetric = ref(
  (route.query.correlation as string) || metrics[0].key
)

// Sync to URL on change
watch(selectedMetric, (newMetric) => {
  router.replace({
    query: { ...route.query, correlation: newMetric }
  })
})

const currentMetric = computed(
  () => metrics.find(m => m.key === selectedMetric.value) ?? metrics[0]
)

// Prepare data for selected metric
const correlationData = computed(() => {
  if (!history.value?.length) return []
  return history.value.map(snapshot => ({
    date: snapshot.date,
    metricValue: currentMetric.value.getValue(snapshot),
    stars: snapshot.github.stars
  }))
})

// Calculate Pearson correlation coefficient
const calculateCorrelation = (
  data: { metricValue: number, stars: number }[]
) => {
  if (data.length < 2) return null
  const n = data.length
  const sumX = data.reduce((s, d) => s + d.metricValue, 0)
  const sumY = data.reduce((s, d) => s + d.stars, 0)
  const sumXY = data.reduce((s, d) => s + d.metricValue * d.stars, 0)
  const sumX2 = data.reduce((s, d) => s + d.metricValue ** 2, 0)
  const sumY2 = data.reduce((s, d) => s + d.stars ** 2, 0)
  const num = n * sumXY - sumX * sumY
  const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
  if (den === 0) return 0
  return num / den
}

// Calculate correlations for all metrics
const allCorrelations = computed(() => {
  if (!history.value?.length) return []
  return metrics.map(metric => ({
    ...metric,
    correlation:
      calculateCorrelation(
        history.value!.map(s => ({
          metricValue: metric.getValue(s),
          stars: s.github.stars
        }))
      ) ?? 0
  }))
})

// Current correlation
const correlation = computed(() => calculateCorrelation(correlationData.value))

// Get correlation strength label
const getCorrelationLabel = (r: number | null) => {
  if (r === null) return 'N/A'
  const abs = Math.abs(r)
  if (abs >= 0.8) return 'Very Strong'
  if (abs >= 0.6) return 'Strong'
  if (abs >= 0.4) return 'Moderate'
  if (abs >= 0.2) return 'Weak'
  return 'Very Weak'
}

// Max and min values for scaling and context
const maxMetricValue = computed(() =>
  Math.max(...correlationData.value.map(d => d.metricValue), 1)
)
const minMetricValue = computed(() =>
  Math.min(...correlationData.value.map(d => d.metricValue), 0)
)
const maxStars = computed(() => {
  const values = correlationData.value.map(d => d.stars)
  return values.length ? Math.max(...values) : 1
})
const minStars = computed(() => {
  const values = correlationData.value.map(d => d.stars)
  return values.length ? Math.min(...values) : 0
})

// Calculate variance to determine if correlation is meaningful
const starsVariance = computed(() => maxStars.value - minStars.value)
const metricVariance = computed(
  () => maxMetricValue.value - minMetricValue.value
)
const _hasLowVariance = computed(
  () => starsVariance.value < 3 || metricVariance.value < 5
)

// Build SVG path for stars trend line
const starsLinePath = computed(() => {
  if (correlationData.value.length < 2) return ''
  const points = correlationData.value.map((point, index) => {
    const x = (index / (correlationData.value.length - 1)) * 100
    const y = 100 - (point.stars / maxStars.value) * 100
    return `${x},${y}`
  })
  return `M ${points.join(' L ')}`
})

// Format date
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Tooltip state
const hoveredPoint = ref<number | null>(null)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-git-compare"
              class="w-5 h-5 text-primary-500"
            />
            <span class="font-semibold text-gray-900 dark:text-white">
              Metric Correlations to GitHub Stars
            </span>
          </div>
        </div>

        <!-- Correlation Summary Cards -->
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="metric in allCorrelations"
            :key="metric.key"
            class="p-2 rounded-lg border transition-all text-center"
            :class="[
              selectedMetric === metric.key
                ? `bg-${metric.color}-50 dark:bg-${metric.color}-900/30 border-${metric.color}-300 dark:border-${metric.color}-700`
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
            ]"
            @click="selectedMetric = metric.key"
          >
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ metric.label }}
            </div>
            <div
              class="text-lg font-bold"
              :class="
                metric.correlation >= 0.4
                  ? 'text-green-600'
                  : metric.correlation >= 0.2
                    ? 'text-yellow-600'
                    : 'text-gray-400'
              "
            >
              r = {{ metric.correlation.toFixed(2) }}
            </div>
            <div class="text-[10px] text-gray-400">
              {{ getCorrelationLabel(metric.correlation) }}
            </div>
          </button>
        </div>
      </div>
    </template>

    <div
      v-if="status === 'pending'"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-6 h-6 animate-spin text-primary-500"
      />
    </div>

    <div
      v-else-if="correlationData.length === 0"
      class="text-center py-8"
    >
      <UIcon
        name="i-lucide-chart-scatter"
        class="w-12 h-12 text-gray-300 mx-auto mb-2"
      />
      <p class="text-sm text-gray-500">
        No correlation data available yet
      </p>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <!-- Chart Title -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span
            class="font-medium"
            :class="`text-${currentMetric.color}-500`"
          >{{ currentMetric.label }}</span>
          <span class="mx-1">→</span>
          <span class="font-medium text-yellow-500">Stars</span>
          <span class="text-gray-400 ml-2">({{ currentMetric.description }})</span>
        </div>
        <UBadge
          :color="
            (correlation ?? 0) >= 0.4
              ? 'success'
              : (correlation ?? 0) >= 0.2
                ? 'warning'
                : 'neutral'
          "
          variant="soft"
        >
          r = {{ (correlation ?? 0).toFixed(2) }}
        </UBadge>
      </div>

      <!-- Dual-axis chart -->
      <div class="relative h-48 sm:h-56">
        <!-- Y-axis labels -->
        <div
          class="absolute left-0 top-0 bottom-6 w-14 flex flex-col justify-between text-xs text-gray-400"
        >
          <span>{{ formatNumber(maxMetricValue) }}</span>
          <span
            :class="`text-${currentMetric.color}-500`"
            class="flex items-center gap-1"
          >
            {{ currentMetric.label }}
          </span>
        </div>
        <div
          class="absolute right-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs text-gray-400 text-right"
        >
          <span>{{ maxStars }}</span>
          <span class="text-yellow-500 flex items-center justify-end gap-1">
            ⭐
          </span>
        </div>

        <!-- Chart area -->
        <div
          class="absolute left-16 right-12 top-0 bottom-6 border-l border-b border-gray-200 dark:border-gray-700"
        >
          <!-- Stars trend line (SVG overlay) -->
          <svg
            class="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <!-- Trend line for stars -->
            <path
              v-if="starsLinePath"
              :d="starsLinePath"
              fill="none"
              stroke="#facc15"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="drop-shadow-sm"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          <!-- Bars and dots -->
          <div
            class="absolute inset-0 flex items-end justify-between gap-px px-1"
          >
            <div
              v-for="(point, index) in correlationData"
              :key="point.date"
              class="flex-1 relative flex flex-col items-center justify-end cursor-pointer group"
              @mouseenter="hoveredPoint = index"
              @mouseleave="hoveredPoint = null"
            >
              <!-- Metric bar -->
              <div
                class="w-full rounded-t-sm transition-all duration-300"
                :class="[
                  currentMetric.bgClass,
                  hoveredPoint === index
                    ? 'opacity-100'
                    : hoveredPoint !== null
                      ? 'opacity-50'
                      : 'opacity-70'
                ]"
                :style="{
                  height: `${(point.metricValue / maxMetricValue) * 100}%`
                }"
              />

              <!-- Stars dot -->
              <div
                class="absolute w-3 h-3 rounded-full bg-yellow-400 border-2 border-white dark:border-gray-900 shadow-lg transition-transform duration-300 z-10"
                :class="{ 'scale-125': hoveredPoint === index }"
                :style="{ bottom: `${(point.stars / maxStars) * 100}%` }"
              />

              <!-- Tooltip -->
              <Transition
                enter-active-class="transition-all duration-200"
                leave-active-class="transition-all duration-150"
                enter-from-class="opacity-0 translate-y-2"
                leave-from-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="hoveredPoint === index"
                  class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg whitespace-nowrap z-50"
                >
                  <div class="font-medium">
                    {{ formatDate(point.date) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <span :class="`text-${currentMetric.color}-400`">{{
                      formatNumber(point.metricValue)
                    }}</span>
                    <span class="text-gray-400 mx-1">→</span>
                    <span class="text-yellow-400">⭐ {{ point.stars }}</span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- X-axis dates -->
        <div
          class="absolute left-16 right-12 bottom-0 h-6 flex justify-between text-[10px] text-gray-400"
        >
          <span>{{ formatDate(correlationData[0]?.date) }}</span>
          <span>{{
            formatDate(correlationData[correlationData.length - 1]?.date)
          }}</span>
        </div>
      </div>

      <!-- Low variance notice - show when stars haven't changed -->
      <div
        v-if="starsVariance === 0"
        class="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
      >
        <UIcon
          name="i-lucide-info"
          class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
        />
        <div class="text-sm">
          <p class="font-medium text-amber-800 dark:text-amber-300">
            Not enough data for meaningful correlations
          </p>
          <p class="text-amber-600 dark:text-amber-400 mt-1">
            GitHub Stars ({{ maxStars }}) have not changed during the tracking
            period. Correlations will become meaningful as your repositories
            gain or lose stars over time.
          </p>
        </div>
      </div>

      <!-- Insight callout - only show when stars have variance -->
      <div
        v-else-if="correlation !== null && correlation >= 0.3"
        class="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
      >
        <UIcon
          name="i-lucide-lightbulb"
          class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
        />
        <div class="text-sm">
          <p class="font-medium text-green-800 dark:text-green-300">
            {{ correlation >= 0.6 ? "Strong" : "Positive" }} correlation
            detected
          </p>
          <p class="text-green-600 dark:text-green-400 mt-1">
            {{ currentMetric.label }} shows a
            {{ getCorrelationLabel(correlation).toLowerCase() }} relationship
            with GitHub Stars —
            {{ currentMetric.description.toLowerCase() }} contribute to building
            lasting authority.
          </p>
          <!-- Variance context -->
          <p class="text-green-500 dark:text-green-500 mt-1 text-xs">
            ⭐ Stars: {{ minStars }} → {{ maxStars }} (+{{ starsVariance }}) ·
            {{ currentMetric.label }}: {{ formatNumber(minMetricValue) }} →
            {{ formatNumber(maxMetricValue) }}
          </p>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex justify-center gap-6 text-xs text-gray-500">
        <div class="flex items-center gap-1.5">
          <div
            class="w-3 h-3 rounded-sm"
            :class="currentMetric.bgClass"
          />
          <span>{{ currentMetric.label }} ({{ currentMetric.description }})</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div
            class="w-2 h-2 rounded-full bg-yellow-400 border border-white shadow"
          />
          <span>GitHub Stars</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>Pearson correlation: r = {{ (correlation ?? 0).toFixed(3) }}</span>
        <span>{{ correlationData.length }} data points</span>
      </div>
    </template>
  </UCard>
</template>
