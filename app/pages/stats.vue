<script setup lang="ts">
const {
  articles,
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

// Computed stats
const totalArticles = computed(() => articles.value.length);
const totalReactions = computed(() =>
  articles.value.reduce((sum, a) => sum + a.positive_reactions_count, 0),
);
const totalComments = computed(() =>
  articles.value.reduce((sum, a) => sum + a.comments_count, 0),
);
const totalReadingTime = computed(() =>
  articles.value.reduce((sum, a) => sum + a.reading_time_minutes, 0),
);

// Top packages by downloads (top 8)
const topPackages = computed(() =>
  npmStats.value.slice(0, 8).map((pkg) => ({
    name: pkg.name.replace("eslint-plugin-", ""),
    downloads: pkg.downloads,
  })),
);

// Aggregate daily downloads for sparkline
const dailyDownloads = computed(() => {
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
  title: "Stats Dashboard - Ofri Peretz",
  description:
    "Real-time open source statistics including npm downloads, article metrics, and community engagement.",
  ogTitle: "Stats Dashboard - Ofri Peretz",
  ogDescription: "Real-time open source statistics and metrics.",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="py-12 sm:py-16 lg:py-20">
    <UContainer>
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          📊 Open Source Stats
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Real-time metrics from the Interlace ESLint Ecosystem and my content
          across platforms.
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

      <!-- Key Metrics Grid -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-12">
        <!-- Total Downloads -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300"
        >
          <div class="space-y-2">
            <div class="text-3xl sm:text-4xl font-bold text-primary-500">
              <span v-if="npmLoading" class="animate-pulse">...</span>
              <NumberTicker v-else :value="totalDownloads" :duration="1500" />
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              npm Downloads/Month
            </div>
            <UIcon
              name="i-simple-icons-npm"
              class="w-5 h-5 text-red-500 mx-auto"
            />
          </div>
        </UCard>

        <!-- GitHub Stars -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300"
        >
          <div class="space-y-2">
            <div class="text-3xl sm:text-4xl font-bold text-yellow-500">
              <span v-if="githubLoading" class="animate-pulse">...</span>
              <NumberTicker
                v-else
                :value="githubStats.totalStars"
                :duration="1500"
              />
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              GitHub Stars
            </div>
            <UIcon
              name="i-lucide-star"
              class="w-5 h-5 text-yellow-500 mx-auto"
            />
          </div>
        </UCard>

        <!-- Total Articles -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300"
        >
          <div class="space-y-2">
            <div class="text-3xl sm:text-4xl font-bold text-green-500">
              <span v-if="articlesLoading" class="animate-pulse">...</span>
              <NumberTicker v-else :value="totalArticles" :duration="1500" />
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Technical Articles
            </div>
            <UIcon
              name="i-simple-icons-devdotto"
              class="w-5 h-5 text-gray-900 dark:text-white mx-auto"
            />
          </div>
        </UCard>

        <!-- Total Reactions -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300"
        >
          <div class="space-y-2">
            <div class="text-3xl sm:text-4xl font-bold text-red-500">
              <span v-if="articlesLoading" class="animate-pulse">...</span>
              <NumberTicker v-else :value="totalReactions" :duration="1500" />
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Total Reactions
            </div>
            <UIcon name="i-lucide-heart" class="w-5 h-5 text-red-500 mx-auto" />
          </div>
        </UCard>

        <!-- Total Comments -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300"
        >
          <div class="space-y-2">
            <div class="text-3xl sm:text-4xl font-bold text-blue-500">
              <span v-if="articlesLoading" class="animate-pulse">...</span>
              <NumberTicker v-else :value="totalComments" :duration="1500" />
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Comments
            </div>
            <UIcon
              name="i-lucide-message-circle"
              class="w-5 h-5 text-blue-500 mx-auto"
            />
          </div>
        </UCard>
      </div>

      <!-- Download Trend Sparkline -->
      <UCard class="mb-8" v-if="dailyDownloads.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-trending-up"
                class="w-5 h-5 text-primary-500"
              />
              <h3 class="font-semibold text-gray-900 dark:text-white">
                30-Day Download Trend
              </h3>
            </div>
            <span class="text-sm text-gray-500"
              >{{ formatNumber(totalDownloads) }} total</span
            >
          </div>
        </template>

        <div class="h-24 flex items-end gap-1 px-2">
          <div
            v-for="(day, index) in dailyDownloads"
            :key="day.day"
            class="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t transition-all duration-300 hover:from-primary-600 hover:to-primary-400"
            :style="{
              height: `${Math.max(4, (day.downloads / Math.max(...dailyDownloads.map((d) => d.downloads))) * 100)}%`,
            }"
            :title="`${day.day}: ${day.downloads} downloads`"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-2 px-2">
          <span>{{ dailyDownloads[0]?.day?.slice(5) }}</span>
          <span>{{
            dailyDownloads[dailyDownloads.length - 1]?.day?.slice(5)
          }}</span>
        </div>
      </UCard>

      <!-- Charts Section -->
      <div class="grid gap-6 lg:grid-cols-2 mb-12">
        <!-- Package Downloads Chart -->
        <UCard>
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

          <div v-if="npmLoading" class="h-64 flex items-center justify-center">
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
                class="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
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

        <!-- Content Stats -->
        <UCard>
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
            class="h-64 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="w-8 h-8 animate-spin text-primary-500"
            />
          </div>

          <div v-else class="grid grid-cols-2 gap-4">
            <div
              class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <div
                class="text-3xl font-bold text-green-600 dark:text-green-400"
              >
                {{ totalArticles }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Articles Published
              </div>
            </div>
            <div
              class="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800"
            >
              <div class="text-3xl font-bold text-red-600 dark:text-red-400">
                {{ formatNumber(totalReactions) }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total Reactions
              </div>
            </div>
            <div
              class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {{ totalComments }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Comments
              </div>
            </div>
            <div
              class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800"
            >
              <div
                class="text-3xl font-bold text-purple-600 dark:text-purple-400"
              >
                {{ totalReadingTime }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Minutes of Content
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
      </div>

      <!-- Ecosystem Overview -->
      <UCard class="mb-12">
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

        <div
          class="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-center"
        >
          <div
            class="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl"
          >
            <div
              class="text-2xl font-bold text-primary-600 dark:text-primary-400"
            >
              16+
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Packages</div>
          </div>
          <div
            class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl"
          >
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              247+
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Security Rules
            </div>
          </div>
          <div
            class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl"
          >
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              100%
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              FN Disclosure
            </div>
          </div>
          <div
            class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl"
          >
            <div
              class="text-2xl font-bold text-purple-600 dark:text-purple-400"
            >
              OWASP
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Top 10 Coverage
            </div>
          </div>
          <div
            class="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl"
          >
            <div
              class="text-2xl font-bold text-orange-600 dark:text-orange-400"
            >
              100x
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Faster no-cycle
            </div>
          </div>
          <div
            class="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl"
          >
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              AI
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Native Messages
            </div>
          </div>
        </div>
      </UCard>

      <!-- CTA -->
      <div class="text-center">
        <div class="flex flex-wrap justify-center gap-4">
          <UButton
            to="https://www.npmjs.com/~ofriperetz"
            target="_blank"
            color="primary"
            size="lg"
            icon="i-simple-icons-npm"
          >
            View on npm
          </UButton>
          <UButton
            to="https://github.com/ofri-peretz"
            target="_blank"
            color="neutral"
            variant="outline"
            size="lg"
            icon="i-simple-icons-github"
          >
            View on GitHub
          </UButton>
          <UButton
            to="https://dev.to/ofri-peretz"
            target="_blank"
            color="neutral"
            variant="outline"
            size="lg"
            icon="i-simple-icons-devdotto"
          >
            View on dev.to
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>
