<script setup lang="ts">
/**
 * EarlyStageImpactView - Simplified metrics view for early-stage projects (< 10 stars)
 *
 * When GitHub stars are below the threshold, this component replaces the full
 * North Star Funnel with a streamlined view that leads with high-value metrics:
 * - Downloads (utility signal)
 * - Followers (network signal)
 * - Contributions (effort signal)
 * - Content (thought leadership signal)
 *
 * This avoids showing "conversion" metrics that look underwhelming at low star counts.
 */

interface Props {
  downloads: number
  views: number
  followers: number
  githubFollowers?: number
  devtoFollowers?: number
  contributions?: number
  commits?: number
  articles?: number
  readingMinutes?: number
  reactions?: number
  comments?: number
  packages?: number
  loading?: boolean
}

const props = defineProps<Props>()

// Time estimation constants
const AVG_MINUTES_PER_COMMIT = 20
const AVG_MINUTES_PER_PR = 45

// Calculate PRs & Reviews (contributions minus commits)
const prsAndReviews = computed(() =>
  Math.max(0, (props.contributions ?? 0) - (props.commits ?? 0))
)

// Estimate total hours invested
const estimatedHours = computed(() => {
  const commitMinutes = (props.commits ?? 0) * AVG_MINUTES_PER_COMMIT
  const prMinutes = prsAndReviews.value * AVG_MINUTES_PER_PR
  return Math.round((commitMinutes + prMinutes) / 60)
})

// Define the metrics to display - ordered by impressiveness
const metrics = computed(() => [
  {
    id: 'downloads',
    label: 'Package Downloads',
    value: props.downloads,
    icon: 'i-simple-icons-npm',
    iconColor: 'text-red-500',
    color: 'from-red-500 to-orange-500',
    bgColor: 'from-red-500/10 to-orange-500/10',
    borderColor: 'border-red-500/30',
    description: 'Developers using my npm packages',
    subMetrics: [
      { label: 'Packages Published', value: props.packages ?? 0, icon: 'i-lucide-package' }
    ]
  },
  {
    id: 'exposure',
    label: 'Total Reach',
    value: props.views + props.downloads,
    icon: 'i-lucide-eye',
    iconColor: 'text-blue-500',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Views + downloads across platforms',
    subMetrics: [
      { label: 'Article Views', value: props.views, icon: 'i-lucide-file-text' },
      { label: 'Package Downloads', value: props.downloads, icon: 'i-lucide-download' }
    ]
  },
  {
    id: 'followers',
    label: 'Developer Network',
    value: props.followers,
    icon: 'i-lucide-users',
    iconColor: 'text-purple-500',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Following across GitHub & Dev.to',
    subMetrics: [
      { label: 'GitHub', value: props.githubFollowers ?? 0, icon: 'i-simple-icons-github' },
      { label: 'Dev.to', value: props.devtoFollowers ?? 0, icon: 'i-simple-icons-devdotto' }
    ]
  },
  {
    id: 'effort',
    label: 'Development Activity',
    value: props.contributions ?? 0,
    icon: 'i-lucide-git-commit',
    iconColor: 'text-green-500',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30',
    description: `~${estimatedHours.value} hours invested`,
    subMetrics: [
      { label: 'Commits', value: props.commits ?? 0, icon: 'i-lucide-git-commit' },
      { label: 'PRs & Reviews', value: prsAndReviews.value, icon: 'i-lucide-git-pull-request' }
    ]
  },
  {
    id: 'engagement',
    label: 'Community Engagement',
    value: (props.reactions ?? 0) + (props.comments ?? 0),
    icon: 'i-lucide-heart',
    iconColor: 'text-pink-500',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-500/10 to-rose-500/10',
    borderColor: 'border-pink-500/30',
    description: 'Reactions & comments on articles',
    subMetrics: [
      { label: 'Reactions', value: props.reactions ?? 0, icon: 'i-lucide-heart' },
      { label: 'Comments', value: props.comments ?? 0, icon: 'i-lucide-message-square' }
    ]
  },
  {
    id: 'content',
    label: 'Knowledge Sharing',
    value: (props.articles ?? 0) + (props.readingMinutes ?? 0),
    icon: 'i-lucide-book-open',
    iconColor: 'text-amber-500',
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'from-amber-500/10 to-yellow-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Technical articles & read time',
    subMetrics: [
      { label: 'Articles', value: props.articles ?? 0, icon: 'i-lucide-file-text' },
      { label: 'Reading Minutes', value: props.readingMinutes ?? 0, icon: 'i-lucide-clock' }
    ]
  }
])

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toLocaleString()
}

// Expanded state for metric cards
const expandedCards = ref<Set<string>>(new Set())

const toggleCard = (id: string) => {
  if (expandedCards.value.has(id)) {
    expandedCards.value.delete(id)
  } else {
    expandedCards.value.add(id)
  }
}
</script>

<template>
  <UCard class="w-full overflow-hidden">
    <template #header>
      <div class="flex items-start sm:items-center justify-between flex-wrap gap-2">
        <div class="flex items-start sm:items-center gap-2">
          <UIcon
            name="i-lucide-bar-chart-3"
            class="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 shrink-0 mt-0.5 sm:mt-0"
          />
          <div>
            <h3 class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
              Impact Metrics
            </h3>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Real-world signals of developer value
            </p>
          </div>
        </div>
        <UBadge
          color="success"
          variant="soft"
          size="xs"
          class="shrink-0"
        >
          <UIcon
            name="i-lucide-trending-up"
            class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"
          />
          <span class="text-[10px] sm:text-xs">Growing</span>
        </UBadge>
      </div>
    </template>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div
        v-for="metric in metrics"
        :key="metric.id"
        class="relative rounded-xl border bg-linear-to-br p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
        :class="[metric.bgColor, metric.borderColor]"
        @click="toggleCard(metric.id)"
      >
        <!-- Main Metric -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <div
              class="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm"
            >
              <UIcon
                :name="metric.icon"
                class="w-5 h-5"
                :class="metric.iconColor"
              />
            </div>
            <div>
              <div class="text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ metric.label }}
              </div>
              <div class="text-[10px] text-gray-500 dark:text-gray-500">
                {{ metric.description }}
              </div>
            </div>
          </div>
          <UIcon
            :name="expandedCards.has(metric.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-4 h-4 text-gray-400"
          />
        </div>

        <!-- Value -->
        <div
          class="text-2xl sm:text-3xl font-bold tabular-nums bg-clip-text text-transparent bg-linear-to-r"
          :class="metric.color"
        >
          <span
            v-if="loading"
            class="animate-pulse"
          >...</span>
          <NumberTicker
            v-else
            :value="metric.value"
            :duration="2000"
          />
        </div>

        <!-- Expanded Sub-metrics -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-24"
          leave-from-class="opacity-100 max-h-24"
          leave-to-class="opacity-0 max-h-0"
        >
          <div
            v-if="expandedCards.has(metric.id)"
            class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 overflow-hidden"
          >
            <div class="flex flex-wrap gap-3">
              <div
                v-for="sub in metric.subMetrics"
                :key="sub.label"
                class="flex items-center gap-1.5 text-xs"
              >
                <UIcon
                  :name="sub.icon"
                  class="w-3.5 h-3.5 text-gray-400"
                />
                <span class="font-medium text-gray-700 dark:text-gray-300">
                  {{ formatNumber(sub.value) }}
                </span>
                <span class="text-gray-500">{{ sub.label }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <template #footer>
      <div
        class="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2"
      >
        <UIcon
          name="i-lucide-sparkles"
          class="w-4 h-4 text-yellow-500"
        />
        <span>Metrics that demonstrate real developer value and community impact</span>
      </div>
    </template>
  </UCard>
</template>
