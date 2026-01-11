<script setup lang="ts">
/**
 * ImpactMetricsBlock - Unified interactive metrics container
 *
 * Features:
 * - Interactive metric cards with sub-metrics expansion
 * - "View Full Dashboard" CTA for homepage context
 * - Responsive grid layout (single column on mobile)
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
  showCta?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  githubFollowers: 0,
  devtoFollowers: 0,
  contributions: 0,
  commits: 0,
  articles: 0,
  readingMinutes: 0,
  reactions: 0,
  comments: 0,
  packages: 0,
  loading: false,
  showCta: false
})

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
    label: 'Downloads',
    value: props.downloads,
    icon: 'i-simple-icons-npm',
    iconColor: 'text-red-500',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    borderColor: 'border-red-200 dark:border-red-500/30',
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
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    description: 'Views + downloads across platforms',
    subMetrics: [
      { label: 'Article Views', value: props.views, icon: 'i-lucide-file-text' },
      { label: 'Package Downloads', value: props.downloads, icon: 'i-lucide-download' }
    ]
  },
  {
    id: 'followers',
    label: 'Network',
    value: props.followers,
    icon: 'i-lucide-users',
    iconColor: 'text-purple-500',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    borderColor: 'border-purple-200 dark:border-purple-500/30',
    description: 'Following across GitHub & Dev.to',
    subMetrics: [
      { label: 'GitHub', value: props.githubFollowers ?? 0, icon: 'i-simple-icons-github' },
      { label: 'Dev.to', value: props.devtoFollowers ?? 0, icon: 'i-simple-icons-devdotto' }
    ]
  },
  {
    id: 'effort',
    label: 'Activity',
    value: props.contributions ?? 0,
    icon: 'i-lucide-git-commit',
    iconColor: 'text-green-500',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-500/10',
    borderColor: 'border-green-200 dark:border-green-500/30',
    description: `~${estimatedHours.value} hours invested`,
    subMetrics: [
      { label: 'Commits', value: props.commits ?? 0, icon: 'i-lucide-git-commit' },
      { label: 'PRs & Reviews', value: prsAndReviews.value, icon: 'i-lucide-git-pull-request' }
    ]
  },
  {
    id: 'engagement',
    label: 'Engagement',
    value: (props.reactions ?? 0) + (props.comments ?? 0),
    icon: 'i-lucide-heart',
    iconColor: 'text-pink-500',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-500/10',
    borderColor: 'border-pink-200 dark:border-pink-500/30',
    description: 'Reactions & comments',
    subMetrics: [
      { label: 'Reactions', value: props.reactions ?? 0, icon: 'i-lucide-heart' },
      { label: 'Comments', value: props.comments ?? 0, icon: 'i-lucide-message-square' }
    ]
  },
  {
    id: 'content',
    label: 'Content',
    value: (props.articles ?? 0) + (props.readingMinutes ?? 0),
    icon: 'i-lucide-book-open',
    iconColor: 'text-amber-500',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    description: 'Articles & read time',
    subMetrics: [
      { label: 'Articles', value: props.articles ?? 0, icon: 'i-lucide-file-text' },
      { label: 'Reading Minutes', value: props.readingMinutes ?? 0, icon: 'i-lucide-clock' }
    ]
  }
])

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
  <UCard class="w-full overflow-hidden backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
      <LandingMetricCard
        v-for="metric in metrics"
        :id="metric.id"
        :key="metric.id"
        :label="metric.label"
        :value="metric.value"
        :description="metric.description"
        :icon="metric.icon"
        :icon-color="metric.iconColor"
        :color="metric.color"
        :bg-color="metric.bgColor"
        :border-color="metric.borderColor"
        :sub-metrics="metric.subMetrics"
        :loading="loading"
        :is-expanded="expandedCards.has(metric.id)"
        @toggle="toggleCard"
      />
    </div>

    <template #footer>
      <div class="flex flex-col items-center gap-4">
        <div
          v-if="showCta"
          class="flex justify-center w-full"
        >
          <NuxtLink
            to="/stats"
            class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary-600 dark:bg-primary-500/10 border border-primary-600/20 dark:border-primary-500/30 text-sm font-bold text-white dark:text-primary-400 hover:bg-primary-700 dark:hover:bg-primary-500/20 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary-500/10"
          >
            View Full Dashboard
            <UIcon
              name="i-lucide-arrow-right"
              class="w-4 h-4"
            />
          </NuxtLink>
        </div>

        <div
          class="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2"
        >
          <UIcon
            name="i-lucide-sparkles"
            class="w-4 h-4 text-yellow-500"
          />
          <span>Metrics that demonstrate real developer value and community impact</span>
        </div>
      </div>
    </template>
  </UCard>
</template>
