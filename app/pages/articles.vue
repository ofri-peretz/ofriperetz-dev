<script setup lang="ts">
const { articles, loading, error, fetchArticles } = useDevToArticles();
const { stats: githubStats, fetchStats: fetchGitHubStats } = useGitHubStats();

// Medium stats - MUST EXACTLY MATCH stats.vue
// Updated: Jan 4, 2026 - from medium.com/me/stats
const mediumStats = {
  articles: 3, // Number of Medium articles
  claps: 12, // Total claps
  followers: 0, // Medium followers
};

// Fetch GitHub stats on mount for reactions calculation
onMounted(() => {
  fetchGitHubStats();
});

// Computed combined stats - EXACTLY matching stats page formulas
const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0,
    ) || 0,
);

// Combined articles (dev.to + Medium) - matches stats.vue combinedArticles
const totalArticles = computed(
  () => (articles.value?.length || 0) + mediumStats.articles,
);

// Combined reactions: GitHub stars + dev.to reactions + Medium claps - matches stats.vue totalReactions
const totalReactions = computed(
  () =>
    (githubStats.value?.totalStars || 0) +
    devtoReactions.value +
    mediumStats.claps,
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

// ============================================
// SORTING SYSTEM
// ============================================

// Pinned article slugs - shown first in default state
const PINNED_SLUGS = [
  "eslint-plugin-import-vs-eslint-plugin-import-next-up-to-100x-faster",
  "why-eslint-plugin-import-takes-45-seconds-and-how-we-fixed-it",
  "your-eslint-security-plugin-is-missing-80-of-vulnerabilities-i-have-proof",
  "the-30-minute-security-audit-onboarding-a-new-codebase",
  "the-security-engineer-interview-cheat-sheet-for-javascript-developers",
];

// Sort options
type SortOption = "views" | "recent" | "reactions";
type SortOrder = "desc" | "asc";

const sortBy = ref<SortOption>("views");
const sortOrder = ref<SortOrder>("desc");
const isDefaultState = ref(true);

const sortOptions = [
  { value: "views" as SortOption, label: "Views", icon: "i-lucide-eye" },
  { value: "recent" as SortOption, label: "Recent", icon: "i-lucide-calendar" },
  {
    value: "reactions" as SortOption,
    label: "Reactions",
    icon: "i-lucide-heart",
  },
];

// Get current sort option index for sliding indicator
const currentSortIndex = computed(() =>
  sortOptions.findIndex((opt) => opt.value === sortBy.value),
);

// Handle sort option change
const selectSort = (option: SortOption) => {
  if (sortBy.value === option) {
    // Same option clicked - toggle order
    sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
  } else {
    // New option - set to desc and mark as non-default
    sortBy.value = option;
    sortOrder.value = "desc";
  }
  isDefaultState.value = false;
};

// Toggle sort order
const toggleOrder = () => {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
  isDefaultState.value = false;
};

// Reset to default
const resetSort = () => {
  sortBy.value = "views";
  sortOrder.value = "desc";
  isDefaultState.value = true;
};

// Sorted and filtered articles
const sortedArticles = computed(() => {
  if (!articles.value) return [];

  const sorted = [...articles.value].sort((a, b) => {
    let comparison = 0;

    switch (sortBy.value) {
      case "views":
        // dev.to API doesn't expose views, use reactions as proxy
        comparison =
          (b.positive_reactions_count || 0) - (a.positive_reactions_count || 0);
        break;
      case "recent":
        comparison =
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime();
        break;
      case "reactions":
        comparison =
          (b.positive_reactions_count || 0) - (a.positive_reactions_count || 0);
        break;
    }

    return sortOrder.value === "desc" ? comparison : -comparison;
  });

  // If default state, put pinned articles first
  if (isDefaultState.value) {
    const pinned = sorted.filter((a) =>
      PINNED_SLUGS.some((slug) => a.slug?.includes(slug)),
    );
    const notPinned = sorted.filter(
      (a) => !PINNED_SLUGS.some((slug) => a.slug?.includes(slug)),
    );
    return [...pinned, ...notPinned];
  }

  return sorted;
});

// Check if article is pinned (for badge display)
const isPinned = (article: any) =>
  isDefaultState.value &&
  PINNED_SLUGS.some((slug) => article.slug?.includes(slug));

// ============================================
// VIEW MODE
// ============================================

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
        <BlurFade :delay="0">
          <h1 class="text-4xl font-bold mb-4">
            <GradientText animate>Articles</GradientText>
          </h1>
        </BlurFade>
        <BlurFade :delay="50">
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Technical deep-dives on security, ESLint plugins, and AI-native
            development. Published across multiple platforms.
          </p>
        </BlurFade>
        <BlurFade :delay="100">
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <ShimmerButton>
              <NuxtLink
                to="https://dev.to/ofri-peretz"
                target="_blank"
                class="flex items-center gap-2 text-sm"
              >
                <UIcon name="i-simple-icons-devdotto" class="w-4 h-4" />
                Follow on dev.to
                <UIcon
                  name="i-lucide-external-link"
                  class="w-3 h-3 opacity-60"
                />
              </NuxtLink>
            </ShimmerButton>
            <ShimmerButton>
              <NuxtLink
                to="https://medium.com/@ofriperetzdev"
                target="_blank"
                class="flex items-center gap-2 text-sm"
              >
                <UIcon name="i-simple-icons-medium" class="w-4 h-4" />
                Follow on Medium
                <UIcon
                  name="i-lucide-external-link"
                  class="w-3 h-3 opacity-60"
                />
              </NuxtLink>
            </ShimmerButton>
          </div>
        </BlurFade>
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

          <!-- View Mode Toggle - FAQ-style with sliding indicator -->
          <div class="flex items-center gap-3">
            <span
              class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline"
              >View:</span
            >
            <div
              class="relative flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              <!-- Sliding indicator -->
              <div
                class="absolute h-10 w-10 bg-primary-500 rounded-lg transition-all duration-300 ease-out shadow-lg shadow-primary-500/30"
                :style="{
                  left: `${availableViewModes.indexOf(viewMode) * 44 + 4}px`,
                }"
              />
              <button
                v-for="mode in availableViewModes"
                :key="mode"
                @click="viewMode = mode"
                class="relative z-10 flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200"
                :class="
                  viewMode === mode
                    ? 'text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                "
              >
                <UIcon
                  :name="
                    mode === 1
                      ? 'i-lucide-square'
                      : mode === 2
                        ? 'i-lucide-columns-2'
                        : 'i-lucide-grid-3x3'
                  "
                  class="w-5 h-5"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Sort Controls -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
            <!-- Sort Options with sliding indicator -->
            <div
              class="relative flex items-center gap-0.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              <!-- Sliding indicator -->
              <div
                class="absolute h-8 bg-primary-500 rounded-lg transition-all duration-300 ease-out shadow-lg shadow-primary-500/30"
                :style="{
                  width: `${sortOptions[currentSortIndex]?.label.length * 8 + 40}px`,
                  left: `${currentSortIndex * 85 + 4}px`,
                }"
              />
              <button
                v-for="option in sortOptions"
                :key="option.value"
                @click="selectSort(option.value)"
                class="relative z-10 flex items-center gap-1.5 px-3 h-8 rounded-lg transition-colors duration-200 text-sm font-medium"
                :class="
                  sortBy === option.value
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                "
              >
                <UIcon :name="option.icon" class="w-4 h-4" />
                {{ option.label }}
              </button>
            </div>

            <!-- Order Toggle -->
            <button
              @click="toggleOrder"
              class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              :title="sortOrder === 'desc' ? 'Descending' : 'Ascending'"
            >
              <UIcon
                :name="
                  sortOrder === 'desc'
                    ? 'i-lucide-arrow-down'
                    : 'i-lucide-arrow-up'
                "
                class="w-4 h-4 text-gray-600 dark:text-gray-400"
              />
            </button>

            <!-- Reset Button (only show when not in default state) -->
            <button
              v-if="!isDefaultState"
              @click="resetSort"
              class="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400"
            >
              <UIcon name="i-lucide-rotate-ccw" class="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <!-- Pinned indicator -->
          <div
            v-if="isDefaultState"
            class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
          >
            <UIcon name="i-lucide-pin" class="w-4 h-4" />
            <span>Featured articles shown first</span>
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

        <!-- Articles Grid with smooth transition on view change -->
        <Transition name="fade" mode="out-in">
          <div
            v-if="!loading && !error"
            :key="`${viewMode}-${sortBy}-${sortOrder}-${isDefaultState}`"
            class="grid gap-6"
            :class="gridClass"
          >
            <BlurFade
              v-for="(article, index) in sortedArticles"
              :key="article.id"
              :delay="index * 30"
            >
              <div class="relative">
                <!-- Pinned Badge -->
                <div
                  v-if="isPinned(article)"
                  class="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-lg"
                >
                  <UIcon name="i-lucide-pin" class="w-3 h-3" />
                  Featured
                </div>
                <DevToArticleCard :article="article" />
              </div>
            </BlurFade>
          </div>
        </Transition>

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
