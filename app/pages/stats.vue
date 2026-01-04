<script setup lang="ts">
const {
  articles,
  followers: devtoFollowers,
  loading: articlesLoading,
  fetchArticles,
} = useDevToArticles();
const {
  stats: npmStats,
  loading: npmLoading,
  totalDownloads,
  fetchStats: fetchNpmStats,
} = useNpmStats();
const {
  stats: githubStats,
  loading: githubLoading,
  fetchStats: fetchGitHubStats,
} = useGitHubStats();

// Fetch data on mount
onMounted(() => {
  fetchArticles("ofri-peretz", 100);
  fetchNpmStats();
  fetchGitHubStats();
});

// Computed stats - with null safety
const totalArticles = computed(() => articles.value?.length || 0);
const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0,
    ) || 0,
);
const totalComments = computed(
  () =>
    articles.value?.reduce((sum, a) => sum + (a.comments_count || 0), 0) || 0,
);
const totalReadingTime = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.reading_time_minutes || 0),
      0,
    ) || 0,
);

// Medium stats (manual - no free public API, requires RapidAPI subscription)
// Updated: Jan 4, 2026 - from medium.com/me/stats
const mediumStats = {
  articles: 3, // Number of Medium articles
  claps: 12, // Total claps
  followers: 0, // Medium followers
};

// Combined reactions: GitHub stars + dev.to reactions + Medium claps - with null safety
const totalReactions = computed(
  () =>
    (githubStats.value?.totalStars || 0) +
    devtoReactions.value +
    mediumStats.claps,
);

// Combined followers from all platforms (GitHub + dev.to + Medium) - with null safety
const totalFollowers = computed(
  () =>
    (githubStats.value?.followers || 0) +
    (devtoFollowers.value || 0) +
    mediumStats.followers,
);

// Combined articles (dev.to + Medium)
const combinedArticles = computed(
  () => totalArticles.value + mediumStats.articles,
);

// Top packages by downloads (top 8) - with null safety
const topPackages = computed(() => {
  if (!npmStats.value || !Array.isArray(npmStats.value)) return [];
  return npmStats.value.slice(0, 8).map((pkg) => ({
    name: pkg.name?.replace("eslint-plugin-", "") || pkg.name,
    downloads: pkg.downloads || 0,
  }));
});

// Aggregate daily downloads for sparkline - with null safety
const dailyDownloads = computed(() => {
  if (!npmStats.value || !Array.isArray(npmStats.value)) return [];
  const dayMap: Record<string, number> = {};
  npmStats.value.forEach((pkg) => {
    pkg.dailyData?.forEach((d) => {
      dayMap[d.day] = (dayMap[d.day] || 0) + d.downloads;
    });
  });
  return Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, downloads]) => ({ day, downloads }));
});

// Format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

// Language colors
const langColors: Record<string, string> = {
  TypeScript: "from-blue-500 to-blue-400",
  JavaScript: "from-yellow-500 to-yellow-400",
  Python: "from-green-500 to-green-400",
  Vue: "from-emerald-500 to-emerald-400",
  HTML: "from-orange-500 to-orange-400",
  CSS: "from-purple-500 to-purple-400",
};

// Get color for package rank
const getPackageColor = (index: number) => {
  const colors = [
    "from-indigo-500 to-indigo-400",
    "from-green-500 to-green-400",
    "from-blue-500 to-blue-400",
    "from-purple-500 to-purple-400",
    "from-orange-500 to-orange-400",
    "from-pink-500 to-pink-400",
    "from-teal-500 to-teal-400",
    "from-red-500 to-red-400",
  ];
  return colors[index] || "from-gray-500 to-gray-400";
};

useSeoMeta({
  title: "My Impact Dashboard - Ofri Peretz",
  description:
    "Live metrics from my open source projects, technical articles, and developer community engagement.",
  ogTitle: "My Impact Dashboard - Ofri Peretz",
  ogDescription:
    "Live metrics from my open source projects and technical writing.",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="py-12 sm:py-16 lg:py-20">
    <UContainer>
      <!-- Header -->
      <BlurFade :delay="0">
        <div class="text-center mb-12">
          <h1
            class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            <GradientText animate>My Impact Dashboard</GradientText>
          </h1>
          <p
            class="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Live metrics from my open source projects, technical writing, and
            developer community engagement.
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated:
            {{
              new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }}
          </p>
        </div>
      </BlurFade>

      <!-- Key Metrics Grid -->
      <BlurFade :delay="100">
        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          <!-- Total Downloads -->
          <UCard
            class="group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-primary-500/10 to-primary-600/20 dark:from-primary-900/40 dark:to-primary-800/30 border border-primary-500/30"
          >
            <div
              class="flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px]"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-500 tabular-nums"
              >
                <span v-if="npmLoading" class="animate-pulse">...</span>
                <NumberTicker v-else :value="totalDownloads" :duration="1500" />
              </div>
              <div
                class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mt-1"
              >
                npm Downloads
              </div>
              <UIcon
                name="i-simple-icons-npm"
                class="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-1"
              />
            </div>
          </UCard>

          <!-- GitHub Stars -->
          <UCard
            class="group hover:ring-2 hover:ring-yellow-500/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 dark:from-yellow-900/40 dark:to-yellow-800/30 border border-yellow-500/30"
          >
            <div
              class="flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px]"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-500 tabular-nums"
              >
                <span v-if="githubLoading" class="animate-pulse">...</span>
                <NumberTicker
                  v-else
                  :value="githubStats.totalStars"
                  :duration="1500"
                />
              </div>
              <div
                class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mt-1"
              >
                GitHub Stars
              </div>
              <UIcon
                name="i-lucide-star"
                class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-1"
              />
            </div>
          </UCard>

          <!-- Followers (Combined) -->
          <UCard
            class="group hover:ring-2 hover:ring-purple-500/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/30 border border-purple-500/30"
          >
            <div
              class="flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px]"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-500 tabular-nums"
              >
                <span
                  v-if="githubLoading || articlesLoading"
                  class="animate-pulse"
                  >...</span
                >
                <NumberTicker v-else :value="totalFollowers" :duration="1500" />
              </div>
              <div
                class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mt-1"
              >
                Followers
              </div>
              <div class="flex items-center gap-1 mt-1">
                <UIcon
                  name="i-simple-icons-github"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500"
                />
                <UIcon
                  name="i-simple-icons-devdotto"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500"
                />
              </div>
            </div>
          </UCard>

          <!-- Total Articles (Combined) -->
          <UCard
            class="group hover:ring-2 hover:ring-green-500/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-900/40 dark:to-green-800/30 border border-green-500/30"
          >
            <div
              class="flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px]"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500 tabular-nums"
              >
                <span v-if="articlesLoading" class="animate-pulse">...</span>
                <NumberTicker
                  v-else
                  :value="combinedArticles"
                  :duration="1500"
                />
              </div>
              <div
                class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mt-1"
              >
                Articles
              </div>
              <div class="flex items-center gap-1 mt-1">
                <UIcon
                  name="i-simple-icons-devdotto"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500"
                />
                <UIcon
                  name="i-simple-icons-medium"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500"
                />
              </div>
            </div>
          </UCard>

          <!-- Total Reactions (Combined) -->
          <UCard
            class="group hover:ring-2 hover:ring-red-500/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-red-500/10 to-red-600/20 dark:from-red-900/40 dark:to-red-800/30 border border-red-500/30"
          >
            <div
              class="flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px]"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-500 tabular-nums"
              >
                <span
                  v-if="articlesLoading || githubLoading"
                  class="animate-pulse"
                  >...</span
                >
                <NumberTicker v-else :value="totalReactions" :duration="1500" />
              </div>
              <div
                class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mt-1"
              >
                Reactions
              </div>
              <div class="flex items-center gap-1 mt-1">
                <UIcon
                  name="i-lucide-star"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500"
                  title="GitHub Stars"
                />
                <UIcon
                  name="i-simple-icons-devdotto"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500"
                  title="dev.to reactions"
                />
                <UIcon
                  name="i-simple-icons-medium"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500"
                  title="Medium claps"
                />
              </div>
            </div>
          </UCard>

          <!-- Public Repos -->
          <UCard
            class="group hover:ring-2 hover:ring-blue-500/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-900/40 dark:to-blue-800/30 border border-blue-500/30"
          >
            <div
              class="flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px]"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-500 tabular-nums"
              >
                <span v-if="githubLoading" class="animate-pulse">...</span>
                <NumberTicker
                  v-else
                  :value="githubStats.publicRepos"
                  :duration="1500"
                />
              </div>
              <div
                class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mt-1"
              >
                Repositories
              </div>
              <UIcon
                name="i-simple-icons-github"
                class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300 mt-1"
              />
            </div>
          </UCard>
        </div>
      </BlurFade>

      <!-- Download Trend Sparkline -->
      <BlurFade :delay="200">
        <UCard class="mb-8" v-if="dailyDownloads.length > 0">
          <template #header>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-trending-up"
                  class="w-5 h-5 text-primary-500"
                />
                <h3
                  class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base"
                >
                  30-Day Download Trend
                </h3>
              </div>
              <span class="text-xs sm:text-sm text-gray-500"
                >{{ formatNumber(totalDownloads) }} total</span
              >
            </div>
          </template>

          <div
            class="h-20 sm:h-24 flex items-end gap-0.5 sm:gap-1 px-1 sm:px-2"
          >
            <div
              v-for="day in dailyDownloads"
              :key="day.day"
              class="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t transition-all duration-300 hover:from-primary-600 hover:to-primary-400 min-w-[2px]"
              :style="{
                height: `${Math.max(4, (day.downloads / Math.max(...dailyDownloads.map((d) => d.downloads))) * 100)}%`,
              }"
              :title="`${day.day}: ${day.downloads} downloads`"
            />
          </div>
          <div
            class="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-2 px-1 sm:px-2"
          >
            <span>{{ dailyDownloads[0]?.day?.slice(5) }}</span>
            <span>{{
              dailyDownloads[dailyDownloads.length - 1]?.day?.slice(5)
            }}</span>
          </div>
        </UCard>
      </BlurFade>

      <!-- Main Content Grid -->
      <div class="grid gap-6 lg:grid-cols-2 mb-8">
        <!-- Package Downloads Chart -->
        <BlurFade :delay="300">
          <UCard class="h-full">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-bar-chart-2"
                  class="w-5 h-5 text-primary-500"
                />
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  Downloads by Package
                </h3>
              </div>
            </template>

            <div
              v-if="npmLoading"
              class="h-64 flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="w-8 h-8 animate-spin text-primary-500"
              />
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(pkg, index) in topPackages"
                :key="pkg.name"
                class="group"
              >
                <div class="flex justify-between text-sm mb-1">
                  <span
                    class="text-gray-700 dark:text-gray-300 truncate text-xs sm:text-sm"
                    >{{ pkg.name }}</span
                  >
                  <span
                    class="text-gray-500 dark:text-gray-400 font-mono text-xs"
                    >{{ formatNumber(pkg.downloads) }}</span
                  >
                </div>
                <div
                  class="h-2 sm:h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r"
                    :class="getPackageColor(index)"
                    :style="{
                      width: `${(pkg.downloads / (topPackages[0]?.downloads || 1)) * 100}%`,
                    }"
                  />
                </div>
              </div>
            </div>

            <template #footer>
              <div class="text-center">
                <UButton
                  to="https://www.npmjs.com/~ofriperetz"
                  target="_blank"
                  color="primary"
                  variant="ghost"
                  size="sm"
                  trailing-icon="i-lucide-external-link"
                >
                  View All on npm
                </UButton>
              </div>
            </template>
          </UCard>
        </BlurFade>

        <!-- GitHub Activity -->
        <BlurFade :delay="400">
          <UCard class="h-full">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-simple-icons-github" class="w-5 h-5" />
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  GitHub Activity
                </h3>
              </div>
            </template>

            <div
              v-if="githubLoading"
              class="h-64 flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="w-8 h-8 animate-spin text-primary-500"
              />
            </div>

            <div v-else class="space-y-4">
              <!-- Activity Breakdown Chart -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h4
                    class="text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    This Year's Contributions
                  </h4>
                  <div class="text-lg font-bold text-primary-500">
                    <NumberTicker
                      :value="githubStats?.totalContributions || 0"
                      :duration="1500"
                    />
                    <span class="text-xs text-gray-400 ml-1">total</span>
                  </div>
                </div>
                <div class="grid grid-cols-4 gap-2 text-center">
                  <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div
                      class="text-lg font-bold text-green-600 dark:text-green-400"
                    >
                      <NumberTicker
                        :value="githubStats?.recentCommits || 0"
                        :duration="1200"
                      />
                    </div>
                    <div class="text-[10px] text-gray-500">Commits</div>
                  </div>
                  <div
                    class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                  >
                    <div
                      class="text-lg font-bold text-purple-600 dark:text-purple-400"
                    >
                      <NumberTicker
                        :value="githubStats?.recentPRs || 0"
                        :duration="1200"
                      />
                    </div>
                    <div class="text-[10px] text-gray-500">PRs</div>
                  </div>
                  <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div
                      class="text-lg font-bold text-blue-600 dark:text-blue-400"
                    >
                      <NumberTicker
                        :value="githubStats?.recentReviews || 0"
                        :duration="1200"
                      />
                    </div>
                    <div class="text-[10px] text-gray-500">Reviews</div>
                  </div>
                  <div
                    class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                  >
                    <div
                      class="text-lg font-bold text-orange-600 dark:text-orange-400"
                    >
                      <NumberTicker
                        :value="githubStats?.recentIssues || 0"
                        :duration="1200"
                      />
                    </div>
                    <div class="text-[10px] text-gray-500">Issues</div>
                  </div>
                </div>
              </div>

              <!-- Languages -->
              <div>
                <h4
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
                >
                  Top Languages
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="lang in githubStats.languages"
                    :key="lang.name"
                    class="px-2 py-1 text-xs rounded-full bg-gradient-to-r text-white"
                    :class="
                      langColors[lang.name] || 'from-gray-500 to-gray-400'
                    "
                  >
                    {{ lang.name }} ({{ lang.count }})
                  </span>
                </div>
              </div>

              <!-- Recent Events -->
              <div v-if="githubStats.recentEvents.length > 0">
                <h4
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
                >
                  Latest Events
                </h4>
                <div class="space-y-1.5 max-h-32 overflow-y-auto">
                  <div
                    v-for="event in githubStats.recentEvents.slice(0, 5)"
                    :key="event.date + event.repo"
                    class="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <UIcon
                      :name="
                        event.type === 'commit'
                          ? 'i-lucide-git-commit'
                          : event.type === 'pr'
                            ? 'i-lucide-git-pull-request'
                            : event.type === 'review'
                              ? 'i-lucide-eye'
                              : 'i-lucide-circle-dot'
                      "
                      :class="
                        event.type === 'commit'
                          ? 'text-green-500'
                          : event.type === 'pr'
                            ? 'text-purple-500'
                            : event.type === 'review'
                              ? 'text-blue-500'
                              : 'text-orange-500'
                      "
                      class="w-3.5 h-3.5 shrink-0"
                    />
                    <span
                      class="text-gray-600 dark:text-gray-400 truncate flex-1"
                      >{{ event.repo }}</span
                    >
                    <span class="text-gray-400 shrink-0">{{
                      new Date(event.date).toLocaleDateString()
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="text-center">
                <UButton
                  to="https://github.com/ofri-peretz"
                  target="_blank"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  trailing-icon="i-lucide-external-link"
                >
                  View GitHub Profile
                </UButton>
              </div>
            </template>
          </UCard>
        </BlurFade>
      </div>

      <!-- Content Stats -->
      <BlurFade :delay="500">
        <UCard class="mb-8">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-pen-tool" class="w-5 h-5 text-green-500" />
              <h3 class="font-semibold text-gray-900 dark:text-white">
                Content Impact
              </h3>
            </div>
          </template>

          <div
            v-if="articlesLoading"
            class="h-32 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="w-8 h-8 animate-spin text-primary-500"
            />
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div
              class="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <div
                class="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400"
              >
                <NumberTicker :value="totalArticles" :duration="1500" />
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1"
              >
                Articles
              </div>
            </div>
            <div
              class="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800"
            >
              <div
                class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400"
              >
                <NumberTicker :value="totalReactions" :duration="1500" />
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1"
              >
                Reactions
              </div>
            </div>
            <div
              class="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div
                class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400"
              >
                <NumberTicker :value="totalComments" :duration="1500" />
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1"
              >
                Comments
              </div>
            </div>
            <div
              class="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800"
            >
              <div
                class="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400"
              >
                <NumberTicker :value="totalReadingTime" :duration="1500" />
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1"
              >
                Minutes
              </div>
            </div>
          </div>

          <template #footer>
            <div class="text-center">
              <UButton
                to="/articles"
                color="primary"
                variant="ghost"
                size="sm"
                trailing-icon="i-lucide-arrow-right"
              >
                View All Articles
              </UButton>
            </div>
          </template>
        </UCard>
      </BlurFade>

      <!-- Ecosystem Overview -->
      <BlurFade :delay="600">
        <UCard class="mb-8">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-eslint"
                class="w-5 h-5 text-purple-500"
              />
              <h3 class="font-semibold text-gray-900 dark:text-white">
                Interlace ESLint Ecosystem
              </h3>
            </div>
          </template>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              class="p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl flex flex-col items-center justify-center min-h-[80px]"
            >
              <div
                class="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400"
              >
                16+
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                Packages
              </div>
            </div>
            <div
              class="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl flex flex-col items-center justify-center min-h-[80px]"
            >
              <div
                class="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400"
              >
                247+
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                Security Rules
              </div>
            </div>
            <div
              class="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl flex flex-col items-center justify-center min-h-[80px]"
            >
              <div
                class="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400"
              >
                100%
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                FN Disclosure
              </div>
            </div>
            <div
              class="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl flex flex-col items-center justify-center min-h-[80px]"
            >
              <div
                class="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400"
              >
                Top 10
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                OWASP
              </div>
            </div>
            <div
              class="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl flex flex-col items-center justify-center min-h-[80px]"
            >
              <div
                class="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400"
              >
                100x
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                Faster
              </div>
            </div>
            <div
              class="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl flex flex-col items-center justify-center min-h-[80px]"
            >
              <div
                class="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400"
              >
                AI
              </div>
              <div
                class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                Native
              </div>
            </div>
          </div>
        </UCard>
      </BlurFade>

      <!-- CTA -->
      <BlurFade :delay="700">
        <div class="text-center">
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
            <ShimmerButton>
              <NuxtLink
                to="https://www.npmjs.com/~ofriperetz"
                target="_blank"
                class="flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-npm" class="w-4 h-4" />
                View on npm
              </NuxtLink>
            </ShimmerButton>
            <ShimmerButton>
              <NuxtLink
                to="https://github.com/ofri-peretz"
                target="_blank"
                class="flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-github" class="w-4 h-4" />
                View on GitHub
              </NuxtLink>
            </ShimmerButton>
            <ShimmerButton>
              <NuxtLink
                to="https://dev.to/ofri-peretz"
                target="_blank"
                class="flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-devdotto" class="w-4 h-4" />
                View on dev.to
              </NuxtLink>
            </ShimmerButton>
          </div>
        </div>
      </BlurFade>
    </UContainer>
  </div>
</template>
