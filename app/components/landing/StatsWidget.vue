<script setup lang="ts">
const {
  articles,
  followers: devtoFollowers,
  fetchArticles,
} = useDevToArticles();
const { totalDownloads, fetchStats: fetchNpmStats } = useNpmStats();
const { stats: githubStats, fetchStats: fetchGitHubStats } = useGitHubStats();

// Medium stats (manual - matches stats.vue)
const mediumStats = {
  articles: 3,
  claps: 12,
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

// Computed values - matching stats.vue exactly
const totalArticles = computed(
  () => (articles.value?.length || 0) + mediumStats.articles,
);

const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0,
    ) || 0,
);

// Combined reactions: GitHub stars + dev.to reactions + Medium claps
const totalReactions = computed(
  () =>
    (githubStats.value?.totalStars || 0) +
    devtoReactions.value +
    mediumStats.claps,
);

// Combined followers (GitHub + dev.to + Medium)
const totalFollowers = computed(
  () =>
    (githubStats.value?.followers || 0) +
    (devtoFollowers.value || 0) +
    mediumStats.followers,
);
</script>

<template>
  <!-- 2x3 grid matching the stats page layout -->
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
    <!-- npm Downloads -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-5 sm:p-6 lg:p-8 min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl border border-primary-200 dark:border-primary-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
    >
      <div
        class="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 tabular-nums leading-tight"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalDownloads"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
        npm Downloads
      </div>
      <UIcon name="i-simple-icons-npm" class="w-4 h-4 text-red-500 mt-1" />
    </NuxtLink>

    <!-- GitHub Stars -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-5 sm:p-6 lg:p-8 min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
    >
      <div
        class="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-600 dark:text-yellow-400 tabular-nums leading-tight"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="githubStats?.totalStars || 0"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
        GitHub Stars
      </div>
      <UIcon name="i-lucide-star" class="w-4 h-4 text-yellow-500 mt-1" />
    </NuxtLink>

    <!-- Followers -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-5 sm:p-6 lg:p-8 min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
    >
      <div
        class="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 tabular-nums leading-tight"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalFollowers"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
        Followers
      </div>
      <div class="flex items-center gap-1 mt-1">
        <UIcon name="i-simple-icons-github" class="w-3 h-3 text-gray-500" />
        <UIcon name="i-simple-icons-devdotto" class="w-3 h-3 text-gray-500" />
      </div>
    </NuxtLink>

    <!-- Articles -->
    <NuxtLink
      to="/articles"
      class="group flex flex-col items-center justify-center text-center p-5 sm:p-6 lg:p-8 min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
    >
      <div
        class="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 tabular-nums leading-tight"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalArticles"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
        Articles
      </div>
      <div class="flex items-center gap-1 mt-1">
        <UIcon name="i-simple-icons-devdotto" class="w-3 h-3 text-gray-500" />
        <UIcon name="i-simple-icons-medium" class="w-3 h-3 text-gray-500" />
      </div>
    </NuxtLink>

    <!-- Reactions -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-5 sm:p-6 lg:p-8 min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl border border-red-200 dark:border-red-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
    >
      <div
        class="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 dark:text-red-400 tabular-nums leading-tight"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalReactions"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
        Reactions
      </div>
      <div class="flex items-center gap-1 mt-1">
        <UIcon name="i-lucide-star" class="w-3 h-3 text-gray-500" />
        <UIcon name="i-simple-icons-devdotto" class="w-3 h-3 text-gray-500" />
        <UIcon name="i-simple-icons-medium" class="w-3 h-3 text-gray-500" />
      </div>
    </NuxtLink>

    <!-- Repositories -->
    <NuxtLink
      to="/stats"
      class="group flex flex-col items-center justify-center text-center p-5 sm:p-6 lg:p-8 min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
    >
      <div
        class="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums leading-tight"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="githubStats?.publicRepos || 0"
          :duration="2000"
        />
        <span v-else class="animate-pulse">—</span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
        Repositories
      </div>
      <UIcon name="i-simple-icons-github" class="w-4 h-4 text-gray-500 mt-1" />
    </NuxtLink>
  </div>
</template>
