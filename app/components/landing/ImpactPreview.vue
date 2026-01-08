<script setup lang="ts">
/**
 * ImpactPreview - Impressive metrics showcase for home page
 * Shows key metrics in a wide horizontal layout with theme-aware accessibility
 */

const {
  stats: githubStats,
  loading: ghLoading,
  fetchStats: fetchGitHub,
} = useGitHubStats();
const {
  totalDownloads,
  packageCount,
  loading: npmLoading,
  fetchStats: fetchNpm,
} = useNpmStats();
const {
  totalViews,
  followers: devtoFollowers,
  loading: devtoLoading,
  fetchArticles,
} = useDevToArticles();

onMounted(() => {
  fetchGitHub();
  fetchNpm();
  fetchArticles("ofri-peretz", 100);
});

const loading = computed(
  () => ghLoading.value || npmLoading.value || devtoLoading.value,
);

// Computed metrics for display - 6 key metrics with theme-aware colors
// Using the "High-Contrast Colored Boxes" strategy:
// Light Mode: Text 600-700 for labels, 600 for values
// Dark Mode: Bright text (400) for values
const metrics = computed(() => [
  {
    label: "Views",
    value: totalViews.value,
    icon: "i-lucide-eye",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
    borderColor: "border-cyan-200 dark:border-cyan-500/30",
  },
  {
    label: "Downloads",
    value: totalDownloads.value,
    icon: "i-simple-icons-npm",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-500/30",
  },
  {
    label: "Followers",
    value: (githubStats.value?.followers || 0) + (devtoFollowers.value || 0),
    icon: "i-lucide-users",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    borderColor: "border-blue-200 dark:border-blue-500/30",
  },
  {
    label: "Plugins",
    value: packageCount.value,
    icon: "i-lucide-shield-check",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    borderColor: "border-green-200 dark:border-green-500/30",
  },
  {
    label: "Commits",
    value: githubStats.value?.recentCommits || 0,
    icon: "i-lucide-git-commit",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    borderColor: "border-purple-200 dark:border-purple-500/30",
  },
  {
    label: "Repos",
    value: githubStats.value?.totalRepos || 0,
    icon: "i-lucide-folder-git-2",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
    borderColor: "border-orange-200 dark:border-orange-500/30",
  },
]);
</script>

<template>
  <section
    class="relative p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors duration-300"
    aria-labelledby="impact-title"
  >
    <!-- Subtle gradient overlay -->
    <div
      class="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary-500/5 via-transparent to-cyan-500/5 pointer-events-none"
    />

    <!-- Content -->
    <div class="relative z-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-2"
        >
          <UIcon
            name="i-lucide-trending-up"
            class="w-4 h-4 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <h2
            id="impact-title"
            class="text-xs font-bold tracking-wider text-primary-600 dark:text-primary-400 uppercase"
          >
            Open Source Impact
          </h2>
        </div>
      </div>

      <!-- Metrics Grid - 2 cols on mobile, 3 on tablet+ -->
      <div
        class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8"
        role="list"
        aria-label="Impact metrics"
      >
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="relative p-4 sm:p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-within:ring-2 focus-within:ring-primary-500/50 outline-none"
          :class="[metric.bgColor, metric.borderColor]"
          role="listitem"
        >
          <!-- Icon and Label -->
          <div class="flex items-center gap-2 mb-3">
            <div
              class="p-1.5 rounded-lg transition-colors"
              :class="metric.bgColor"
            >
              <UIcon
                :name="metric.icon"
                class="w-4 h-4"
                :class="metric.color"
                aria-hidden="true"
              />
            </div>
            <span
              class="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >{{ metric.label }}</span
            >
          </div>
          <!-- Value -->
          <div
            class="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight"
            :class="metric.color"
          >
            <span
              v-if="loading"
              class="animate-pulse text-lg"
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
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/stats"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-600 dark:bg-primary-500/10 border border-primary-600/20 dark:border-primary-500/30 text-sm font-bold text-white dark:text-primary-400 hover:bg-primary-700 dark:hover:bg-primary-500/20 hover:scale-[1.02] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 outline-none"
        >
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
