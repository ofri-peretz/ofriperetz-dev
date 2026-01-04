<script setup lang="ts">
const {
  articles,
  followers: devtoFollowers,
  fetchArticles,
} = useDevToArticles();
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

// Combined followers (GitHub + dev.to)
// Note: LinkedIn, Medium, and X.com don't have public APIs for follower counts
const totalFollowers = computed(
  () => githubStats.value.followers + devtoFollowers.value,
);

// GitHub engagement (stars + recent activity)
const githubEngagement = computed(
  () =>
    githubStats.value.totalStars +
    githubStats.value.recentCommits +
    githubStats.value.recentPRs,
);
</script>

<template>
  <div class="grid grid-cols-4 gap-2 sm:gap-3">
    <!-- npm Downloads -->
    <NuxtLink
      to="/stats"
      class="group text-center p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl border border-primary-200 dark:border-primary-800 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
    >
      <div
        class="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-0.5"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalDownloads"
          :duration="2000"
        />
        <span v-else class="animate-pulse">-</span>
      </div>
      <div
        class="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <UIcon
          name="i-simple-icons-npm"
          class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500"
        />
        <span class="hidden sm:inline">Downloads</span>
        <span class="sm:hidden">npm</span>
      </div>
    </NuxtLink>

    <!-- GitHub Stars -->
    <NuxtLink
      to="/stats"
      class="group text-center p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
    >
      <div
        class="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-0.5"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="githubStats.totalStars"
          :duration="2000"
        />
        <span v-else class="animate-pulse">-</span>
      </div>
      <div
        class="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <UIcon
          name="i-lucide-star"
          class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500"
        />
        <span class="hidden sm:inline">Stars</span>
        <span class="sm:hidden">★</span>
      </div>
    </NuxtLink>

    <!-- Total Followers (GitHub + dev.to) -->
    <NuxtLink
      to="/stats"
      class="group text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
    >
      <div
        class="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-0.5"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalFollowers"
          :duration="2000"
        />
        <span v-else class="animate-pulse">-</span>
      </div>
      <div
        class="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <UIcon
          name="i-lucide-users"
          class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500"
        />
        <span class="hidden sm:inline">Followers</span>
        <span class="sm:hidden">👥</span>
      </div>
    </NuxtLink>

    <!-- Articles -->
    <NuxtLink
      to="/articles"
      class="group text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-800 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
    >
      <div
        class="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 mb-0.5"
      >
        <NumberTicker
          v-if="hasLoaded"
          :value="totalArticles"
          :duration="2000"
        />
        <span v-else class="animate-pulse">-</span>
      </div>
      <div
        class="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <UIcon
          name="i-simple-icons-devdotto"
          class="w-2.5 h-2.5 sm:w-3 sm:h-3"
        />
        <span class="hidden sm:inline">Articles</span>
        <span class="sm:hidden">Blog</span>
      </div>
    </NuxtLink>
  </div>
</template>
