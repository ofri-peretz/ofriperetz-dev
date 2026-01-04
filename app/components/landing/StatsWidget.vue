<script setup lang="ts">
const { articles, fetchArticles } = useDevToArticles();
const { totalDownloads, fetchStats: fetchNpmStats } = useNpmStats();
const { stats: githubStats, fetchStats: fetchGitHubStats } = useGitHubStats();

// Track if we've fetched data
const hasLoaded = ref(false);

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    fetchArticles("ofri-peretz", 100),
    fetchNpmStats(),
    fetchGitHubStats(),
  ]);
  hasLoaded.value = true;
});

// Computed values
const totalArticles = computed(() => articles.value.length);
</script>

<template>
  <div class="grid grid-cols-3 gap-3 sm:gap-4">
    <!-- npm Downloads -->
    <NuxtLink
      to="/stats"
      class="group text-center p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl border border-primary-200 dark:border-primary-800 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
    >
      <div
        class="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalDownloads"
          :duration="2000"
        />
        <span v-else class="animate-pulse">-</span>
      </div>
      <div
        class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <UIcon name="i-simple-icons-npm" class="w-3 h-3 text-red-500" />
        <span class="hidden sm:inline">Downloads/Mo</span>
        <span class="sm:hidden">npm</span>
      </div>
    </NuxtLink>

    <!-- GitHub Stars -->
    <NuxtLink
      to="/stats"
      class="group text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
    >
      <div
        class="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="githubStats.totalStars"
          :duration="2000"
        />
        <span v-else class="animate-pulse">-</span>
      </div>
      <div
        class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <UIcon name="i-lucide-star" class="w-3 h-3 text-yellow-500" />
        <span class="hidden sm:inline">GitHub Stars</span>
        <span class="sm:hidden">Stars</span>
      </div>
    </NuxtLink>

    <!-- Articles -->
    <NuxtLink
      to="/articles"
      class="group text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-800 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
    >
      <div
        class="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mb-1"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalArticles"
          :duration="2000"
        />
        <span v-else class="animate-pulse">-</span>
      </div>
      <div
        class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <UIcon name="i-simple-icons-devdotto" class="w-3 h-3" />
        <span class="hidden sm:inline">Articles</span>
        <span class="sm:hidden">Posts</span>
      </div>
    </NuxtLink>
  </div>
</template>
