<script setup lang="ts">
/**
 * StatsPreviewContent - Compact content engagement preview for articles page
 * Wide horizontal layout with key metrics and ratios
 */

const { articles, loading, totalViews, fetchArticles } = useDevToArticles()

const isExpanded = ref(false)
const hasExpandedOnce = ref(false)

// Track first expansion for animation purposes
watch(isExpanded, (newVal) => {
  if (newVal && !hasExpandedOnce.value) {
    hasExpandedOnce.value = true
  }
})

onMounted(() => {
  fetchArticles('ofri-peretz', 100)
})

// Dev.to only article count (no hardcoded Medium stats)
const totalArticles = computed(() => articles.value?.length || 0)

// Dev.to reactions only
const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0
    ) || 0
)

// Total reactions: dev.to only (no hardcoded Medium claps)
const totalReactions = computed(() => devtoReactions.value)

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

// Main metrics for display with theme-aware contrast
const metrics = computed(() => [
  {
    label: 'Views',
    value: totalViews.value || 0,
    icon: 'i-lucide-eye',
    iconColor: 'text-cyan-500',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
    borderColor: 'border-cyan-200 dark:border-cyan-500/30'
  },
  {
    label: 'Articles',
    value: totalArticles.value,
    icon: 'i-lucide-file-text',
    iconColor: 'text-green-500',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-500/10',
    borderColor: 'border-green-200 dark:border-green-500/30'
  },
  {
    label: 'Reactions',
    value: totalReactions.value,
    icon: 'i-lucide-heart',
    iconColor: 'text-red-500',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    borderColor: 'border-red-200 dark:border-red-500/30'
  },
  {
    label: 'Comments',
    value: totalComments.value,
    icon: 'i-lucide-message-circle',
    iconColor: 'text-blue-500',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    borderColor: 'border-blue-200 dark:border-blue-500/30'
  }
])
</script>

<template>
  <UCard class="w-full overflow-hidden backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
    <template #header>
      <div
        class="flex items-center justify-between cursor-pointer group/header select-none h-14 sm:h-16"
        @click="isExpanded = !isExpanded"
      >
        <div class="flex items-center gap-2 group-hover/header:translate-x-1 transition-transform duration-300">
          <div class="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover/header:border-emerald-500/50 transition-colors">
            <UIcon
              name="i-lucide-file-text"
              class="size-4 text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <h2
              id="engagement-title"
              class="text-sm font-black tracking-widest text-gray-900 dark:text-white uppercase leading-none"
            >
              Engagement Overview
            </h2>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-none">
              Deep-dive metrics from my technical writing
            </p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <UBadge
            color="neutral"
            variant="soft"
            size="sm"
            class="font-black uppercase tracking-tighter"
          >
            {{ totalArticles }} Articles
          </UBadge>
          <div
            class="flex items-center justify-center size-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 group-hover/header:border-primary-500/50 group-hover/header:shadow-md"
            :class="isExpanded ? 'rotate-180 bg-primary-50 dark:bg-primary-900/20 border-primary-500/30' : ''"
          >
            <UIcon
              name="i-lucide-chevron-down"
              class="size-5 transition-colors duration-300"
              :class="isExpanded ? 'text-primary-500' : 'text-gray-400'"
            />
          </div>
        </div>
      </div>
    </template>

    <AnimatePresence>
      <Motion
        v-if="isExpanded"
        :initial="{ height: 0, opacity: 0, filter: 'blur(10px)' }"
        :animate="{ height: 'auto', opacity: 1, filter: 'blur(0px)' }"
        :exit="{ height: 0, opacity: 0, filter: 'blur(10px)' }"
        :transition="{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }"
        class="overflow-hidden"
      >
        <div class="relative z-10 w-full pt-4">
          <!-- Main Summary Ratios -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <!-- Views Efficiency -->
            <div class="flex items-center justify-between p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors group/ratio">
              <div class="min-w-0">
                <div class="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
                  Views / Article
                </div>
                <div class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tabular-nums flex items-baseline gap-1 truncate">
                  <span
                    v-if="loading"
                    class="animate-pulse"
                  >...</span>
                  <template v-else>
                    <NumberTicker
                      :value="viewsPerArticle"
                      :skip-animation="hasExpandedOnce && !isExpanded"
                    />
                    <span class="text-sm font-medium text-gray-500 uppercase tracking-tighter">Avg</span>
                  </template>
                </div>
              </div>
              <UIcon
                name="i-lucide-trending-up"
                class="size-10 text-cyan-500/10 group-hover/ratio:text-cyan-500/20 group-hover/ratio:scale-110 transition-all duration-500 shrink-0"
              />
            </div>

            <!-- Engagement Efficiency -->
            <div class="flex items-center justify-between p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-colors group/ratio">
              <div class="min-w-0">
                <div class="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                  Engagement Ratio
                </div>
                <div class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tabular-nums flex items-baseline gap-1 truncate">
                  <span
                    v-if="loading"
                    class="animate-pulse"
                  >...</span>
                  <template v-else>
                    <NumberTicker
                      :value="Number(engagementPerArticle)"
                      :decimal-places="1"
                      :skip-animation="hasExpandedOnce && !isExpanded"
                    />
                    <span class="text-sm font-medium text-gray-500 uppercase tracking-tighter">/ Art</span>
                  </template>
                </div>
              </div>
              <UIcon
                name="i-lucide-heart"
                class="size-10 text-purple-500/10 group-hover/ratio:text-purple-500/20 group-hover/ratio:scale-110 transition-all duration-500 shrink-0"
              />
            </div>
          </div>

          <!-- Detail Metrics Grid - 2x2 on Desktop, 1x4 on Mobile -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LandingMetricCard
              v-for="metric in metrics"
              :id="metric.label"
              :key="metric.label"
              :label="metric.label"
              :value="metric.value"
              :icon="metric.icon"
              :icon-color="metric.iconColor"
              :color="metric.color"
              :bg-color="metric.bgColor"
              :border-color="metric.borderColor"
              :loading="loading"
            />
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <template
      v-if="isExpanded"
      #footer
    >
      <div class="flex flex-col items-center gap-4">
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

        <!-- Footer Message -->
        <div
          class="text-center text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 opacity-60"
        >
          <UIcon
            name="i-lucide-sparkles"
            class="w-3 h-3 text-yellow-500"
          />
          <span>Verifiable engagement data from Dev.to API</span>
        </div>
      </div>
    </template>
  </UCard>
</template>
