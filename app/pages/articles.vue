<script setup lang="ts">
const { articles, loading, error, fetchArticles } = useDevToArticles();

// Medium stats (manual for now - no public API) - MUST match stats.vue
const mediumStats = {
  articles: 3,
  claps: 0,
  followers: 0,
};

// Computed combined stats to match stats page
const totalArticles = computed(
  () => (articles.value?.length || 0) + mediumStats.articles,
);
const totalReactions = computed(
  () =>
    (articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0,
    ) || 0) + mediumStats.claps,
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

// View mode: 1, 2, or 3 columns
const viewMode = ref(3);

// Get available view modes based on screen size
const { width } = useWindowSize();
const availableViewModes = computed(() => {
  if (width.value < 640) return [1]; // sm: only 1 column
  if (width.value < 1024) return [1, 2]; // md: 1 or 2 columns
  return [1, 2, 3]; // lg: all options
});

// Ensure view mode is valid for current screen size
watch(
  availableViewModes,
  (modes) => {
    if (!modes.includes(viewMode.value)) {
      viewMode.value = Math.max(...modes);
    }
  },
  { immediate: true },
);

// Grid class based on view mode
const gridClass = computed(() => {
  switch (viewMode.value) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
});

// Fetch articles on mount
onMounted(() => {
  fetchArticles("ofri-peretz", 100);
});

useSeoMeta({
  title: "Technical Articles - Ofri Peretz | Security & ESLint",
  description:
    "30+ technical articles on application security, ESLint plugin development, and AI-native development. Published on dev.to and Medium.",
  ogTitle: "Technical Articles - Ofri Peretz",
  ogDescription:
    "30+ deep-dive articles on security, ESLint plugins & AI-native development.",
  ogImage: "https://ofriperetz.dev/og-articles.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: "website",
  ogUrl: "https://ofriperetz.dev/articles",
  twitterCard: "summary_large_image",
  twitterImage: "https://ofriperetz.dev/og-articles.png",
  twitterTitle: "Technical Articles - Ofri Peretz",
  twitterDescription:
    "30+ deep-dive articles on security, ESLint plugins & AI-native development.",
});
</script>

<template>
  <div class="py-12 sm:py-16 lg:py-20">
    <UContainer>
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Articles
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Technical deep-dives on security, ESLint plugins, and AI-native
          development. Published across multiple platforms.
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <UButton
            to="https://dev.to/ofri-peretz"
            target="_blank"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-devdotto"
          >
            Follow on dev.to
          </UButton>
          <UButton
            to="https://medium.com/@ofriperetzdev"
            target="_blank"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-medium"
          >
            Follow on Medium
          </UButton>
        </div>
      </div>

      <!-- Article Stats Widgets - larger layout for multi-digit numbers -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <!-- Total Articles -->
        <div
          class="text-center p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-900/40 dark:to-green-800/30 rounded-2xl border-2 border-green-500/30"
        >
          <div
            class="text-3xl sm:text-4xl lg:text-5xl font-black text-green-500 tabular-nums mb-2"
          >
            <NumberTicker
              v-if="!loading"
              :value="totalArticles"
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            Articles
          </div>
          <div class="flex items-center justify-center gap-1.5">
            <UIcon
              name="i-simple-icons-devdotto"
              class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"
            />
            <UIcon
              name="i-simple-icons-medium"
              class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"
            />
          </div>
        </div>

        <!-- Total Reactions -->
        <div
          class="text-center p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-red-500/10 to-red-600/20 dark:from-red-900/40 dark:to-red-800/30 rounded-2xl border-2 border-red-500/30"
        >
          <div
            class="text-3xl sm:text-4xl lg:text-5xl font-black text-red-500 tabular-nums mb-2"
          >
            <NumberTicker
              v-if="!loading"
              :value="totalReactions"
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            Reactions
          </div>
          <UIcon
            name="i-lucide-heart"
            class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500"
          />
        </div>

        <!-- Total Comments -->
        <div
          class="text-center p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-900/40 dark:to-blue-800/30 rounded-2xl border-2 border-blue-500/30"
        >
          <div
            class="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-500 tabular-nums mb-2"
          >
            <NumberTicker
              v-if="!loading"
              :value="totalComments"
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            Comments
          </div>
          <UIcon
            name="i-lucide-message-circle"
            class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500"
          />
        </div>

        <!-- Reading Time -->
        <div
          class="text-center p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/30 rounded-2xl border-2 border-purple-500/30"
        >
          <div
            class="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-500 tabular-nums mb-2"
          >
            <NumberTicker
              v-if="!loading"
              :value="totalReadingTime"
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            Minutes
          </div>
          <UIcon name="i-lucide-clock" class="w-3 h-3 text-purple-500 mt-1" />
        </div>
      </div>

      <!-- dev.to Section -->
      <div class="mb-16">
        <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div class="flex items-center gap-3">
            <UIcon
              name="i-simple-icons-devdotto"
              class="w-6 h-6 text-gray-900 dark:text-white"
            />
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              dev.to Articles
            </h2>
            <UBadge color="primary" variant="subtle">Auto-synced</UBadge>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex items-center gap-2">
            <span
              class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline"
              >View:</span
            >
            <UButtonGroup size="sm" orientation="horizontal">
              <UButton
                v-for="mode in availableViewModes"
                :key="mode"
                :color="viewMode === mode ? 'primary' : 'neutral'"
                :variant="viewMode === mode ? 'solid' : 'ghost'"
                @click="viewMode = mode"
                :icon="
                  mode === 1
                    ? 'i-lucide-square'
                    : mode === 2
                      ? 'i-lucide-columns-2'
                      : 'i-lucide-grid-3x3'
                "
              />
            </UButtonGroup>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-primary-500"
          />
        </div>

        <!-- Error State -->
        <UAlert
          v-else-if="error"
          color="red"
          icon="i-lucide-alert-circle"
          title="Failed to load articles"
          :description="error"
          class="mb-8"
        />

        <!-- Articles Grid -->
        <div v-else class="grid gap-6" :class="gridClass">
          <DevToArticleCard
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </div>

        <!-- Empty State -->
        <div
          v-if="!loading && !error && articles.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-lucide-file-text"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">No articles found.</p>
        </div>

        <!-- View More CTA -->
        <div v-if="articles.length > 0" class="text-center mt-8">
          <UButton
            to="https://dev.to/ofri-peretz"
            target="_blank"
            color="primary"
            variant="outline"
            trailing-icon="i-lucide-external-link"
          >
            View All on dev.to
          </UButton>
        </div>
      </div>

      <!-- Medium Section -->
      <div>
        <div class="flex items-center gap-3 mb-6">
          <UIcon
            name="i-simple-icons-medium"
            class="w-6 h-6 text-gray-900 dark:text-white"
          />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Medium Articles
          </h2>
        </div>

        <UCard class="text-center py-8">
          <div class="space-y-4">
            <UIcon
              name="i-simple-icons-medium"
              class="w-12 h-12 text-gray-400 mx-auto"
            />
            <p class="text-gray-600 dark:text-gray-400">
              I also publish articles on Medium. Check out my profile for more
              content!
            </p>
            <UButton
              to="https://medium.com/@ofriperetzdev"
              target="_blank"
              color="primary"
              size="lg"
              trailing-icon="i-lucide-external-link"
            >
              View Articles on Medium
            </UButton>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
