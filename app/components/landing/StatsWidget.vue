<script setup lang="ts">
const {
  articles,
  followers: devtoFollowers,
  fetchArticles,
} = useDevToArticles();
const { totalDownloads, fetchStats: fetchNpmStats } = useNpmStats();
const { stats: githubStats, fetchStats: fetchGitHubStats } = useGitHubStats();

// Medium stats (manual for now - no public API)
const mediumStats = {
  articles: 3,
  claps: 0,
  followers: 0,
};

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

// Computed values - with null safety + Medium
const totalArticles = computed(
  () => (articles.value?.length || 0) + mediumStats.articles,
);

// Combined followers (GitHub + dev.to + Medium) - with null safety
const totalFollowers = computed(
  () =>
    (githubStats.value?.followers || 0) +
    (devtoFollowers.value || 0) +
    mediumStats.followers,
);
</script>

<template>
  <!-- 2x2 grid - larger cards that scale well with big numbers -->
  <div class="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6 max-w-2xl mx-auto">
    <!-- npm Downloads -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-6 sm:p-8 lg:p-10 min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl border border-primary-200 dark:border-primary-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
    >
      <div
        class="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400 tabular-nums leading-tight whitespace-nowrap"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalDownloads"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div
        class="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-2"
      >
        <UIcon
          name="i-simple-icons-npm"
          class="w-4 h-4 text-red-500 shrink-0"
        />
        <span>Downloads</span>
      </div>
    </NuxtLink>

    <!-- GitHub Stars -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-6 sm:p-8 lg:p-10 min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
    >
      <div
        class="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-600 dark:text-yellow-400 tabular-nums leading-tight whitespace-nowrap"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="githubStats?.totalStars || 0"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div
        class="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-2"
      >
        <UIcon name="i-lucide-star" class="w-4 h-4 text-yellow-500 shrink-0" />
        <span>Stars</span>
      </div>
    </NuxtLink>

    <!-- Total Followers -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-6 sm:p-8 lg:p-10 min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
    >
      <div
        class="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 dark:text-purple-400 tabular-nums leading-tight whitespace-nowrap"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalFollowers"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div
        class="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-2"
      >
        <UIcon name="i-lucide-users" class="w-4 h-4 text-purple-500 shrink-0" />
        <span>Followers</span>
      </div>
    </NuxtLink>

    <!-- Articles -->
    <NuxtLink
      to="/articles"
      class="group flex flex-col items-center justify-center text-center p-6 sm:p-8 lg:p-10 min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
    >
      <div
        class="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 dark:text-green-400 tabular-nums leading-tight whitespace-nowrap"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalArticles"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div
        class="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-2"
      >
        <UIcon name="i-simple-icons-devdotto" class="w-4 h-4 shrink-0" />
        <span>Articles</span>
      </div>
    </NuxtLink>
  </div>
</template>
