<script setup lang="ts">
/**
 * StatsPreviewContent - Compact content engagement preview for articles page
 * Wide horizontal layout with key metrics and ratios
 */

const { articles, loading, totalViews, fetchArticles } = useDevToArticles()

// Medium stats (matches stats page)
const mediumStats = {
  articles: 3,
  claps: 12
}

onMounted(() => {
  fetchArticles('ofri-peretz', 100)
})

// Match stats page calculations
const totalArticles = computed(
  () => (articles.value?.length || 0) + mediumStats.articles
)

// Dev.to reactions only (not including stars per user request)
const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0
    ) || 0
)

// Total reactions: dev.to reactions + Medium claps (NO GitHub stars)
const totalReactions = computed(() => devtoReactions.value + mediumStats.claps)

const totalComments = computed(
  () =>
    articles.value?.reduce((sum, a) => sum + (a.comments_count || 0), 0) || 0
)

const _totalReadingTime = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.reading_time_minutes || 0),
      0
    ) || 0
)

// Ratio metrics
const viewsPerArticle = computed(() => {
  if (!totalArticles.value) return 0
  return Math.round((totalViews.value || 0) / totalArticles.value)
})

const engagementPerArticle = computed(() => {
  if (!totalArticles.value) return 0
  return (
    (totalReactions.value + totalComments.value)
    / totalArticles.value
  ).toFixed(1)
})

// Main metrics for display
const metrics = computed(() => [
  {
    label: 'Views',
    value: totalViews.value || 0,
    icon: 'i-lucide-eye',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  {
    label: 'Articles',
    value: totalArticles.value,
    icon: 'i-lucide-file-text',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    label: 'Reactions',
    value: totalReactions.value,
    icon: 'i-lucide-heart',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  {
    label: 'Comments',
    value: totalComments.value,
    icon: 'i-lucide-message-circle',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
])
</script>

<template>
  <div
    class="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-teal-900/20 backdrop-blur-xl border border-green-700/30 shadow-xl"
  >
    <!-- Content -->
    <div class="relative z-10">
      <!-- Header -->
      <div class="text-center mb-5">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20"
        >
          <UIcon
            name="i-lucide-file-text"
            class="w-4 h-4 text-green-400"
          />
          <span
            class="text-xs font-semibold tracking-wider text-green-400 uppercase"
          >
            Content Engagement
          </span>
        </div>
      </div>

      <!-- Ratio Metrics - Prominent display -->
      <div class="flex justify-center gap-8 sm:gap-12 mb-5">
        <div class="text-center">
          <div
            class="text-3xl sm:text-4xl font-bold text-cyan-400 tabular-nums"
          >
            <span
              v-if="loading"
              class="animate-pulse text-lg"
            >...</span>
            <NumberTicker
              v-else
              :value="viewsPerArticle"
              :duration="1500"
            />
          </div>
          <div class="text-xs text-gray-400 mt-1">
            Views / Article
          </div>
        </div>
        <div class="w-px bg-gray-700" />
        <div class="text-center">
          <div
            class="text-3xl sm:text-4xl font-bold text-purple-400 tabular-nums"
          >
            <span
              v-if="loading"
              class="animate-pulse text-lg"
            >...</span>
            <span v-else>{{ engagementPerArticle }}</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">
            Engagement / Article
          </div>
        </div>
      </div>

      <!-- Metrics Grid - Single row -->
      <div class="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="text-center p-2.5 sm:p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
          :class="[metric.bgColor, metric.borderColor]"
        >
          <UIcon
            :name="metric.icon"
            class="w-4 h-4 mx-auto mb-1"
            :class="metric.color"
          />
          <div
            class="text-lg sm:text-xl font-bold tabular-nums"
            :class="metric.color"
          >
            <span
              v-if="loading"
              class="animate-pulse text-sm"
            >...</span>
            <NumberTicker
              v-else
              :value="metric.value"
              :duration="1500"
            />
          </div>
          <div class="text-[10px] sm:text-xs text-gray-400">
            {{ metric.label }}
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/stats?view=classic"
          class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-sm font-medium text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
        >
          <UIcon
            name="i-lucide-funnel"
            class="w-4 h-4"
          />
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
