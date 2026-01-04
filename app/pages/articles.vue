<script setup lang="ts">
const { articles, loading, error, fetchArticles } = useDevToArticles();

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
  fetchArticles("ofri-peretz", 12);
});

useSeoMeta({
  title: "Articles - Ofri Peretz",
  description:
    "Technical articles on security, ESLint, and AI-native development by Ofri Peretz. Published on dev.to and Medium.",
  ogTitle: "Articles - Ofri Peretz",
  ogDescription:
    "Technical articles on security, ESLint, and AI-native development.",
  ogImage: "https://ofriperetz.dev/og-image.png",
  twitterCard: "summary_large_image",
  twitterImage: "https://ofriperetz.dev/og-image.png",
});

// Dynamic OG Image
defineOgImage({
  component: "OgImageTemplate",
  title: "Technical Articles",
  description: "Security, ESLint & AI-native development",
  pageType: "articles",
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

      <!-- Article Stats Widgets -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
        <!-- Total Articles -->
        <div
          class="text-center p-4 sm:p-5 bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-900/40 dark:to-green-800/30 rounded-xl border border-green-500/30"
        >
          <div
            class="text-2xl sm:text-3xl font-bold text-green-500 tabular-nums mb-1"
          >
            <NumberTicker
              v-if="!loading"
              :value="articles?.length || 0"
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Articles
          </div>
          <div class="flex items-center justify-center gap-1 mt-1">
            <UIcon
              name="i-simple-icons-devdotto"
              class="w-3 h-3 text-gray-500"
            />
            <UIcon name="i-simple-icons-medium" class="w-3 h-3 text-gray-500" />
          </div>
        </div>

        <!-- Total Reactions -->
        <div
          class="text-center p-4 sm:p-5 bg-gradient-to-br from-red-500/10 to-red-600/20 dark:from-red-900/40 dark:to-red-800/30 rounded-xl border border-red-500/30"
        >
          <div
            class="text-2xl sm:text-3xl font-bold text-red-500 tabular-nums mb-1"
          >
            <NumberTicker
              v-if="!loading"
              :value="
                articles?.reduce(
                  (sum, a) => sum + (a.positive_reactions_count || 0),
                  0,
                ) || 0
              "
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Reactions
          </div>
          <UIcon name="i-lucide-heart" class="w-3 h-3 text-red-500 mt-1" />
        </div>

        <!-- Total Comments -->
        <div
          class="text-center p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-900/40 dark:to-blue-800/30 rounded-xl border border-blue-500/30"
        >
          <div
            class="text-2xl sm:text-3xl font-bold text-blue-500 tabular-nums mb-1"
          >
            <NumberTicker
              v-if="!loading"
              :value="
                articles?.reduce(
                  (sum, a) => sum + (a.comments_count || 0),
                  0,
                ) || 0
              "
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Comments
          </div>
          <UIcon
            name="i-lucide-message-circle"
            class="w-3 h-3 text-blue-500 mt-1"
          />
        </div>

        <!-- Reading Time -->
        <div
          class="text-center p-4 sm:p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/30 rounded-xl border border-purple-500/30"
        >
          <div
            class="text-2xl sm:text-3xl font-bold text-purple-500 tabular-nums mb-1"
          >
            <NumberTicker
              v-if="!loading"
              :value="
                articles?.reduce(
                  (sum, a) => sum + (a.reading_time_minutes || 0),
                  0,
                ) || 0
              "
              :duration="1500"
            />
            <span v-else class="animate-pulse">...</span>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
