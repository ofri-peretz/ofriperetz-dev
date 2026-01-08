<script setup lang="ts">
/**
 * StatsPreviewContent - Compact content engagement preview for articles page
 * Wide horizontal layout with key metrics and ratios
 */

const { articles, loading, totalViews, fetchArticles } = useDevToArticles();

// Medium stats (matches stats page)
const mediumStats = {
  articles: 3,
  claps: 12,
};

onMounted(() => {
  fetchArticles("ofri-peretz", 100);
});

// Match stats page calculations
const totalArticles = computed(
  () => (articles.value?.length || 0) + mediumStats.articles,
);

// Dev.to reactions only (not including stars per user request)
const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0,
    ) || 0,
);

// Total reactions: dev.to reactions + Medium claps (NO GitHub stars)
const totalReactions = computed(() => devtoReactions.value + mediumStats.claps);

const totalComments = computed(
  () =>
    articles.value?.reduce((sum, a) => sum + (a.comments_count || 0), 0) || 0,
);

const _totalReadingTime = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.reading_time_minutes || 0),
      0,
    ) || 0,
);

// Ratio metrics
const viewsPerArticle = computed(() => {
  if (!totalArticles.value) return 0;
  return Math.round((totalViews.value || 0) / totalArticles.value);
});

const engagementPerArticle = computed(() => {
  if (!totalArticles.value) return 0;
  return (
    (totalReactions.value + totalComments.value) /
    totalArticles.value
  ).toFixed(1);
});

// Main metrics for display with theme-aware contrast
const metrics = computed(() => [
  {
    label: "Views",
    value: totalViews.value || 0,
    icon: "i-lucide-eye",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
    borderColor: "border-cyan-200 dark:border-cyan-500/30",
  },
  {
    label: "Articles",
    value: totalArticles.value,
    icon: "i-lucide-file-text",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    borderColor: "border-green-200 dark:border-green-500/30",
  },
  {
    label: "Reactions",
    value: totalReactions.value,
    icon: "i-lucide-heart",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-500/30",
  },
  {
    label: "Comments",
    value: totalComments.value,
    icon: "i-lucide-message-circle",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    borderColor: "border-blue-200 dark:border-blue-500/30",
  },
]);
</script>

<template>
  <section
    class="relative p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-700/30 shadow-xl transition-colors duration-300"
    aria-labelledby="engagement-title"
  >
    <!-- Content -->
    <div class="relative z-10">
      <!-- Header -->
      <div class="text-center mb-5">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
        >
          <UIcon
            name="i-lucide-file-text"
            class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <h2
            id="engagement-title"
            class="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase"
          >
            Content Engagement
          </h2>
        </div>
      </div>

      <!-- Ratio Metrics - Prominent display -->
      <div class="flex justify-center items-center gap-8 sm:gap-12 mb-5">
        <div class="text-center">
          <div
            class="text-3xl sm:text-4xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums"
          >
            <span
              v-if="loading"
              class="animate-pulse text-lg"
              aria-label="Loading"
              >...</span
            >
            <NumberTicker
              v-else
              :value="viewsPerArticle"
              :duration="1500"
              :aria-label="`${viewsPerArticle} views per article`"
            />
          </div>
          <div
            class="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1"
          >
            Views / Article
          </div>
        </div>
        <div
          class="w-px h-12 bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        />
        <div class="text-center">
          <div
            class="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 tabular-nums"
          >
            <span
              v-if="loading"
              class="animate-pulse text-lg"
              aria-label="Loading"
              >...</span
            >
            <span v-else>{{ engagementPerArticle }}</span>
          </div>
          <div
            class="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1"
          >
            Engagement / Article
          </div>
        </div>
      </div>

      <!-- Metrics Grid - Single row -->
      <div
        class="grid grid-cols-4 gap-2 sm:gap-3 mb-5"
        role="list"
        aria-label="Article metrics"
      >
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="text-center p-2.5 sm:p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-emerald-500/50 outline-none"
          :class="[metric.bgColor, metric.borderColor]"
          role="listitem"
        >
          <UIcon
            :name="metric.icon"
            class="w-4 h-4 mx-auto mb-1"
            :class="metric.color"
            aria-hidden="true"
          />
          <div
            class="text-lg sm:text-xl font-bold tabular-nums"
            :class="metric.color"
          >
            <span
              v-if="loading"
              class="animate-pulse text-sm"
              aria-label="Loading"
              >...</span
            >
            <NumberTicker
              v-else
              :value="metric.value"
              :duration="1500"
              :aria-label="`${metric.value} ${metric.label}`"
            />
          </div>
          <div
            class="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter"
          >
            {{ metric.label }}
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/stats?view=classic"
          class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 dark:bg-emerald-500/10 border border-emerald-600/20 dark:border-emerald-500/30 text-sm font-bold text-white dark:text-emerald-400 hover:bg-emerald-700 dark:hover:bg-emerald-500/20 hover:scale-[1.02] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 outline-none"
        >
          <UIcon name="i-lucide-funnel" class="w-4 h-4" aria-hidden="true" />
          View Full Dashboard
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
