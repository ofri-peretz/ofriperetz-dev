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
  twitterCard: "summary_large_image",
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
            <div
              class="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                v-for="mode in availableViewModes"
                :key="mode"
                @click="viewMode = mode"
                class="px-3 py-1.5 text-sm transition-colors"
                :class="[
                  viewMode === mode
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
                ]"
              >
                <UIcon
                  :name="
                    mode === 1
                      ? 'i-lucide-square'
                      : mode === 2
                        ? 'i-lucide-layout-grid'
                        : 'i-lucide-grid-3x3'
                  "
                  class="w-4 h-4"
                />
              </button>
            </div>
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
