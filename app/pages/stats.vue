<script setup lang="ts">
const {
  articles,
  loading: articlesLoading,
  fetchArticles,
} = useDevToArticles();
const {
  stats,
  loading: npmLoading,
  totalDownloads,
  fetchStats,
} = useNpmStats();

// Fetch data on mount
onMounted(() => {
  fetchArticles("ofri-peretz", 100);
  fetchStats();
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

// Top packages by downloads
const topPackages = computed(() => {
  return Object.entries(stats.value)
    .filter(([_, data]) => data?.downloads)
    .map(([name, data]) => ({
      name: name.replace("eslint-plugin-", ""),
      downloads: data.downloads,
    }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 8);
});

// Format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
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
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <!-- Total Downloads -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all"
        >
          <div class="space-y-2">
            <div class="text-4xl font-bold text-primary-500">
              <span v-if="npmLoading" class="animate-pulse">...</span>
              <span v-else>{{ formatNumber(totalDownloads) }}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              npm Downloads/Month
            </div>
            <UIcon
              name="i-simple-icons-npm"
              class="w-5 h-5 text-red-500 mx-auto"
            />
          </div>
        </UCard>

        <!-- Total Articles -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all"
        >
          <div class="space-y-2">
            <div class="text-4xl font-bold text-green-500">
              <span v-if="articlesLoading" class="animate-pulse">...</span>
              <span v-else>{{ totalArticles }}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
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
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all"
        >
          <div class="space-y-2">
            <div class="text-4xl font-bold text-red-500">
              <span v-if="articlesLoading" class="animate-pulse">...</span>
              <span v-else>{{ formatNumber(totalReactions) }}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Total Reactions
            </div>
            <UIcon name="i-lucide-heart" class="w-5 h-5 text-red-500 mx-auto" />
          </div>
        </UCard>

        <!-- Total Comments -->
        <UCard
          class="text-center group hover:ring-2 hover:ring-primary-500/50 transition-all"
        >
          <div class="space-y-2">
            <div class="text-4xl font-bold text-blue-500">
              <span v-if="articlesLoading" class="animate-pulse">...</span>
              <span v-else>{{ totalComments }}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Comments</div>
            <UIcon
              name="i-lucide-message-circle"
              class="w-5 h-5 text-blue-500 mx-auto"
            />
          </div>
        </UCard>
      </div>

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
                <span class="text-gray-700 dark:text-gray-300 truncate">{{
                  pkg.name
                }}</span>
                <span class="text-gray-500 dark:text-gray-400 font-mono">{{
                  formatNumber(pkg.downloads)
                }}</span>
              </div>
              <div
                class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
              >
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="[
                    index === 0
                      ? 'bg-gradient-to-r from-primary-500 to-primary-400'
                      : index === 1
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : index === 2
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                          : 'bg-gradient-to-r from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500',
                  ]"
                  :style="{
                    width: `${(pkg.downloads / (topPackages[0]?.downloads || 1)) * 100}%`,
                  }"
                />
              </div>
            </div>
          </div>
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
              class="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div class="text-3xl font-bold text-primary-500">
                {{ totalArticles }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Articles Published
              </div>
            </div>
            <div
              class="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div class="text-3xl font-bold text-red-500">
                {{ formatNumber(totalReactions) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total Reactions
              </div>
            </div>
            <div
              class="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div class="text-3xl font-bold text-blue-500">
                {{ totalComments }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Comments
              </div>
            </div>
            <div
              class="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div class="text-3xl font-bold text-green-500">
                {{ totalReadingTime }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
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

        <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-6 text-center">
          <div class="p-4">
            <div class="text-2xl font-bold text-primary-500">16+</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Packages</div>
          </div>
          <div class="p-4">
            <div class="text-2xl font-bold text-green-500">247+</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Security Rules
            </div>
          </div>
          <div class="p-4">
            <div class="text-2xl font-bold text-blue-500">100%</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              FN Disclosure
            </div>
          </div>
          <div class="p-4">
            <div class="text-2xl font-bold text-purple-500">OWASP</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Top 10 Coverage
            </div>
          </div>
          <div class="p-4">
            <div class="text-2xl font-bold text-orange-500">100x</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Faster no-cycle
            </div>
          </div>
          <div class="p-4">
            <div class="text-2xl font-bold text-red-500">AI</div>
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
        </div>
      </div>
    </UContainer>
  </div>
</template>
