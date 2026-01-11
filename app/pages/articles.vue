<script setup lang="ts">
import type { DevToArticle } from '~/composables/useDevToArticles'

// SSR-compatible data fetching - fetch on server for faster initial render
const { data: articlesData, status: articlesStatus, error } = await useAsyncData(
  'devto-articles',
  () => $fetch<{ articles: DevToArticle[], source: string }>('/api/devto-articles'),
  {
    default: () => ({ articles: [], source: 'loading' }),
    server: true,
    lazy: false
  }
)

const { data: githubData } = await useAsyncData(
  'github-stats-articles',
  () => $fetch<{ totalStars: number, followers: number }>('/api/github-stats'),
  {
    default: () => ({ totalStars: 0, followers: 0 }),
    server: true,
    lazy: true // GitHub stats can load lazily since not critical for initial render
  }
)

// Computed refs for template compatibility
const articles = computed(() => articlesData.value?.articles || [])
const loading = computed(() => articlesStatus.value === 'pending')
const githubStats = computed(() => githubData.value)

// Medium stats - MUST EXACTLY MATCH stats.vue
// Updated: Jan 4, 2026 - from medium.com/me/stats
const mediumStats = {
  articles: 0, // Number of Medium articles
  claps: 0, // Total claps
  followers: 0 // Medium followers
}

// Computed combined stats - EXACTLY matching stats page formulas
const devtoReactions = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.positive_reactions_count || 0),
      0
    ) || 0
)

// Combined articles (dev.to + Medium) - matches stats.vue combinedArticles
const _totalArticles = computed(
  () => (articles.value?.length || 0) + mediumStats.articles
)

// Combined reactions: GitHub stars + dev.to reactions + Medium claps - matches stats.vue totalReactions
const _totalReactions = computed(
  () =>
    (githubStats.value?.totalStars || 0)
    + devtoReactions.value
    + mediumStats.claps
)

const _totalComments = computed(
  () =>
    articles.value?.reduce((sum, a) => sum + (a.comments_count || 0), 0) || 0
)

const _totalReadingTime = computed(
  () =>
    articles.value?.reduce(
      (sum, a) => sum + (a.reading_time_minutes || 0),
      0
    ) || 0
)

// ============================================
// FILTER & SEARCH SYSTEM
// ============================================

const search = ref('')
const selectedTags = ref<Set<string>>(new Set())

// Get all unique tags from articles, excluding common ones
const allTags = computed(() => {
  const tags = new Set<string>()
  articles.value.forEach((article) => {
    article.tag_list.forEach(tag => tags.add(tag))
  })
  // Filter out generic tags like 'eslint' if they are too common
  return Array.from(tags).filter(t => t.toLowerCase() !== 'eslint').sort()
})

const toggleTag = (tag: string) => {
  if (selectedTags.value.has(tag)) {
    selectedTags.value.delete(tag)
  } else {
    selectedTags.value.add(tag)
  }
  isDefaultState.value = false
}

const clearTags = () => {
  selectedTags.value.clear()
}

const showTagFilters = ref(false)
const tagFilterRef = ref(null)

// Close tag filter dropdown when clicking outside
onClickOutside(tagFilterRef, () => {
  showTagFilters.value = false
})

// Sort options
type SortOption = 'views' | 'recent' | 'reactions'
type SortOrder = 'desc' | 'asc'

const sortBy = ref<SortOption>('views')
const sortOrder = ref<SortOrder>('desc')
const isDefaultState = ref(true)

const sortOptions = [
  { value: 'recent' as SortOption, label: 'Recent', icon: 'i-lucide-calendar' },
  { value: 'views' as SortOption, label: 'Views', icon: 'i-lucide-eye' },
  { value: 'reactions' as SortOption, label: 'Reactions', icon: 'i-lucide-heart' },
  { value: 'comments' as SortOption, label: 'Comments', icon: 'i-lucide-message-circle' },
  { value: 'reading_time' as SortOption, label: 'Read Time', icon: 'i-lucide-clock' }
]

// Handle sort option change
const selectSort = (option: SortOption) => {
  if (sortBy.value === option) {
    // Same option clicked - toggle order
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    // New option - set to desc and mark as non-default
    sortBy.value = option
    sortOrder.value = 'desc'
  }
  isDefaultState.value = false
}

// Reset to default
const resetSort = () => {
  sortBy.value = 'recent'
  sortOrder.value = 'desc'
  search.value = ''
  selectedTags.value.clear()
  isDefaultState.value = true
}

// Sorted and filtered articles
const filteredArticles = computed(() => {
  if (!articles.value) return []

  // 1. FILTERING
  const result = articles.value.filter((article) => {
    // Search match
    const matchesSearch = !search.value
      || article.title.toLowerCase().includes(search.value.toLowerCase())
      || article.description.toLowerCase().includes(search.value.toLowerCase())

    // Tag match (AND logic as per docs)
    const matchesTags = selectedTags.value.size === 0
      || Array.from(selectedTags.value).every(tag => article.tag_list.includes(tag))

    return matchesSearch && matchesTags
  })

  // 2. SORTING
  result.sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'views':
        comparison = (b.page_views_count || 0) - (a.page_views_count || 0)
        break
      case 'recent':
        comparison = new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        break
      case 'reactions':
        comparison = (b.positive_reactions_count || 0) - (a.positive_reactions_count || 0)
        break
      case 'comments':
        comparison = (b.comments_count || 0) - (a.comments_count || 0)
        break
      case 'reading_time':
        comparison = (b.reading_time_minutes || 0) - (a.reading_time_minutes || 0)
        break
    }

    return sortOrder.value === 'desc' ? comparison : -comparison
  })

  // 3. FEATURED PINNING (only in default state)
  const PINNED_SLUGS = [
    'eslint-plugin-import-vs-eslint-plugin-import-next-up-to-100x-faster',
    'why-eslint-plugin-import-takes-45-seconds-and-how-we-fixed-it',
    'your-eslint-security-plugin-is-missing-80-of-vulnerabilities-i-have-proof',
    'the-30-minute-security-audit-onboarding-a-new-codebase',
    'the-security-engineer-interview-cheat-sheet-for-javascript-developers'
  ]

  if (isDefaultState.value && !search.value && selectedTags.value.size === 0) {
    const pinned = result.filter(a =>
      PINNED_SLUGS.some(slug => a.slug?.includes(slug))
    )
    const notPinned = result.filter(
      a => !PINNED_SLUGS.some(slug => a.slug?.includes(slug))
    )
    return [...pinned, ...notPinned]
  }

  return result
})

// For pagination, use filteredArticles
const sortedArticles = filteredArticles

// Check if article is pinned (for badge display)
const isPinned = (article: any) => {
  const PINNED_SLUGS = [
    'eslint-plugin-import-vs-eslint-plugin-import-next-up-to-100x-faster',
    'why-eslint-plugin-import-takes-45-seconds-and-how-we-fixed-it',
    'your-eslint-security-plugin-is-missing-80-of-vulnerabilities-i-have-proof',
    'the-30-minute-security-audit-onboarding-a-new-codebase',
    'the-security-engineer-interview-cheat-sheet-for-javascript-developers'
  ]
  return isDefaultState.value
    && !search.value
    && selectedTags.value.size === 0
    && PINNED_SLUGS.some(slug => article.slug?.includes(slug))
}

// ============================================
// WINDOW SIZE (used by pagination and view mode)
// ============================================
const { width } = useWindowSize()

// ============================================
// PAGINATION (URL-synced for deep linking)
// ============================================

const route = useRoute()
const router = useRouter()

// Read initial page from URL query param
const initialPage = computed(() => {
  const pageParam = route.query.page
  const parsed = parseInt(pageParam as string, 10)
  return !isNaN(parsed) && parsed >= 1 ? parsed : 1
})

const currentArticlePage = ref(initialPage.value)

// Sync URL when page changes
watch(currentArticlePage, (newPage) => {
  const query = { ...route.query }
  if (newPage === 1) {
    delete query.page
  } else {
    query.page = String(newPage)
  }
  router.replace({ query })
})

// Read page from URL on route change (back/forward buttons)
watch(
  () => route.query.page,
  (newPage) => {
    const parsed = parseInt(newPage as string, 10)
    if (!isNaN(parsed) && parsed >= 1) {
      currentArticlePage.value = parsed
    } else if (!newPage) {
      currentArticlePage.value = 1
    }
  }
)

// Responsive items per page
const itemsPerPage = computed(() => {
  if (width.value >= 1024) return 12 // lg: 12 items
  if (width.value >= 768) return 9 // md: 9 items
  return 6 // sm: 6 items
})

// Reset to page 1 when items per page changes
watch(itemsPerPage, () => {
  currentArticlePage.value = 1
})

// Reset to page 1 when sort changes
watch([sortBy, sortOrder, isDefaultState], () => {
  currentArticlePage.value = 1
})

const totalArticlePages = computed(() =>
  Math.ceil(sortedArticles.value.length / itemsPerPage.value)
)

const paginatedArticles = computed(() => {
  const start = (currentArticlePage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedArticles.value.slice(start, end)
})

const goToArticlePage = (page: number) => {
  currentArticlePage.value = page
  // Scroll to top of controls section
  const section = document.getElementById('articles-controls')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ============================================
// VIEW MODE
// ============================================

// View mode: 1, 2, or 3 columns
const viewMode = ref(3)

// Get available view modes based on screen size
const availableViewModes = computed(() => {
  if (width.value < 640) return [1] // sm: only 1 column
  if (width.value < 1024) return [1, 2] // md: 1 or 2 columns
  return [1, 2, 3] // lg: all options
})

// Ensure view mode is valid for current screen size
watch(
  availableViewModes,
  (modes) => {
    if (!modes.includes(viewMode.value)) {
      viewMode.value = Math.max(...modes)
    }
  },
  { immediate: true }
)

// Grid class based on view mode
const gridClass = computed(() => {
  switch (viewMode.value) {
    case 1:
      return 'grid-cols-1'
    case 2:
      return 'grid-cols-1 sm:grid-cols-2'
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    default:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  }
})

// Note: Data is now fetched server-side via useAsyncData at the top of this file

useSeoMeta({
  title: 'Technical Articles - Ofri Peretz | Security & ESLint',
  description:
    '30+ technical articles on application security, ESLint plugin development, and AI-native development. Published on dev.to and Medium.',
  ogTitle: 'Technical Articles - Ofri Peretz',
  ogDescription:
    '30+ deep-dive articles on security, ESLint plugins & AI-native development.',
  ogImage: 'https://ofriperetz.dev/og-articles.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: 'website',
  ogUrl: 'https://ofriperetz.dev/articles',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://ofriperetz.dev/og-articles.png',
  twitterTitle: 'Technical Articles - Ofri Peretz',
  twitterDescription:
    '30+ deep-dive articles on security, ESLint plugins & AI-native development.'
})

// BreadcrumbList schema for rich snippets
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://ofriperetz.dev'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Articles',
            'item': 'https://ofriperetz.dev/articles'
          }
        ]
      })
    }
  ]
})

// TOC items for articles page
const tocItems = [
  { id: 'articles-header', label: 'Overview' },
  { id: 'articles-stats', label: 'Stats' },
  { id: 'devto-articles', label: 'dev.to Articles' },
  { id: 'medium-articles', label: 'Medium' }
]
</script>

<template>
  <div class="py-6 sm:py-10">
    <!-- Floating TOC -->
    <FloatingToc :items="tocItems" />

    <UContainer>
      <!-- Header -->
      <div
        id="articles-header"
        data-toc-section
        class="text-center mb-12 scroll-mt-20"
      >
        <BlurFade :delay="0">
          <h1 class="text-4xl font-bold mb-4">
            <GradientText animate>
              Articles
            </GradientText>
          </h1>
        </BlurFade>
        <BlurFade :delay="25">
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Technical deep-dives on security, ESLint plugins, and AI-native
            development. Published across multiple platforms.
          </p>
        </BlurFade>
      </div>

      <!-- Content Engagement Preview -->
      <div
        id="articles-stats"
        data-toc-section
        class="mb-12 scroll-mt-20 max-w-4xl mx-auto"
      >
        <LandingStatsPreviewContent />
      </div>

      <!-- Filter & Action Section -->
      <div class="mb-10 space-y-4 relative z-50">
        <!-- Search Bar: Full width, prominent -->
        <div class="relative group">
          <UIcon
            name="i-lucide-search"
            class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 transition-colors group-focus-within:text-primary-500"
          />
          <input
            v-model="search"
            type="text"
            placeholder="Search articles by title or description..."
            class="w-full h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:text-gray-400"
          >
        </div>

        <!-- Premium Action Bar: Consolidated Tags, Sort & View -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-1.5 bg-gray-50/50 dark:bg-gray-800/20 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-2xl">
          <!-- Left Part: Tags Dropdown (Integrated) -->
          <div
            ref="tagFilterRef"
            class="relative shrink-0"
          >
            <button
              class="w-full lg:w-auto flex items-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm group/tags"
              :class="selectedTags.size > 0 ? 'ring-2 ring-primary-500/20 border-primary-500/50' : ''"
              @click="showTagFilters = !showTagFilters"
            >
              <UIcon
                name="i-lucide-filter"
                class="size-4"
                :class="selectedTags.size > 0 ? 'text-primary-500' : 'text-gray-400'"
              />
              <span class="text-[11px] font-black uppercase tracking-wider">
                Tags
                <span
                  v-if="selectedTags.size > 0"
                  class="ml-1 text-primary-500"
                >({{ selectedTags.size }})</span>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-3.5 transition-transform duration-200"
                :class="showTagFilters ? 'rotate-180' : ''"
              />
            </button>

            <!-- Tags Dropdown Content -->
            <div
              v-if="showTagFilters"
              class="absolute left-0 lg:left-0 w-[calc(100vw-2rem)] sm:w-80 mt-2 p-4 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl transition-none"
            >
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-500">Filter by tags</span>
                <button
                  v-if="selectedTags.size > 0"
                  class="text-[10px] font-bold text-red-500 hover:text-red-600 underline"
                  @click="clearTags"
                >
                  Clear All
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
                <button
                  v-for="tag in allTags"
                  :key="tag"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-none border"
                  :class="selectedTags.has(tag)
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-500/30'"
                  @click="toggleTag(tag)"
                >
                  <div
                    class="size-1.5 rounded-full shrink-0"
                    :class="selectedTags.has(tag) ? 'bg-white' : 'bg-gray-300 dark:bg-gray-600'"
                  />
                  <span class="text-[10px] font-black uppercase truncate leading-none">#{{ tag }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Middle Part: Sort Controls (Integrated) -->
          <div class="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-800/50">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg transition-all text-[10px] font-black uppercase tracking-tight whitespace-nowrap"
              :class="sortBy === option.value
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'"
              @click="selectSort(option.value)"
            >
              <UIcon
                :name="option.icon"
                class="size-3.5"
              />
              <span class="hidden sm:inline">{{ option.label }}</span>
              <UIcon
                v-if="sortBy === option.value"
                :name="sortOrder === 'desc' ? 'i-lucide-arrow-down' : 'i-lucide-arrow-up'"
                class="size-3 opacity-80"
              />
            </button>
          </div>

          <!-- Right Part: Meta info & View toggle -->
          <div class="flex items-center justify-between lg:justify-end gap-3 px-1 lg:px-2 shrink-0">
            <!-- Result Count: Single line bold badge style -->
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-800/50">
              <span class="text-[10px] font-black text-gray-900 dark:text-white">{{ filteredArticles.length }}</span>
              <span class="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Articles</span>
            </div>

            <div class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 hidden lg:block" />

            <!-- View Toggles -->
            <div class="flex items-center gap-1 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <button
                v-for="mode in availableViewModes"
                :key="mode"
                class="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                :class="viewMode === mode
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'"
                @click="viewMode = mode"
              >
                <UIcon
                  :name="mode === 1 ? 'i-lucide-square' : mode === 2 ? 'i-lucide-grid-2x2' : 'i-lucide-grid-3x3'"
                  class="size-4"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- dev.to Section -->
      <div
        id="devto-articles"
        data-toc-section
        class="mb-16 scroll-mt-20"
      >
        <!-- Top Pagination Controls -->
        <div
          v-if="totalArticlePages > 1 && !loading && !error"
          id="articles-controls"
          class="flex justify-center items-center gap-3 mb-8 scroll-mt-20"
        >
          <button
            :disabled="currentArticlePage === 1"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            @click="goToArticlePage(currentArticlePage - 1)"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="size-4"
            />
            Prev
          </button>

          <div class="flex items-center gap-2 px-4 py-2 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Page</span>
            <span class="text-sm font-black text-primary-500">{{ currentArticlePage }}</span>
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400">of</span>
            <span class="text-sm font-black">{{ totalArticlePages }}</span>
          </div>

          <button
            :disabled="currentArticlePage === totalArticlePages"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            @click="goToArticlePage(currentArticlePage + 1)"
          >
            Next
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4"
            />
          </button>
        </div>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex justify-center py-12"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-primary-500"
          />
        </div>

        <!-- Error State -->
        <UAlert
          v-else-if="error"
          color="error"
          icon="i-lucide-alert-circle"
          title="Failed to load articles"
          :description="error?.message || 'Unknown error'"
          class="mb-8"
        />

        <div
          v-if="!loading && !error"
          :key="`${viewMode}-${sortBy}-${sortOrder}-${isDefaultState}`"
          class="grid gap-6"
          :class="gridClass"
        >
          <div
            v-for="article in paginatedArticles"
            :key="article.id"
            class="relative"
          >
            <!-- Pinned Badge -->
            <div
              v-if="isPinned(article)"
              class="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-lg"
            >
              <UIcon
                name="i-lucide-pin"
                class="w-3 h-3"
              />
              Featured
            </div>
            <DevToArticleCard :article="article" />
          </div>
        </div>

        <!-- Bottom Pagination Controls -->
        <div
          v-if="totalArticlePages > 1"
          class="flex justify-center items-center gap-3 mt-12"
        >
          <button
            :disabled="currentArticlePage === 1"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            @click="goToArticlePage(currentArticlePage - 1)"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="size-4"
            />
            Prev
          </button>

          <div class="flex items-center gap-2 px-4 py-2 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Page</span>
            <span class="text-sm font-black text-primary-500">{{ currentArticlePage }}</span>
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400">of</span>
            <span class="text-sm font-black">{{ totalArticlePages }}</span>
          </div>

          <button
            :disabled="currentArticlePage === totalArticlePages"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            @click="goToArticlePage(currentArticlePage + 1)"
          >
            Next
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4"
            />
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-if="!loading && !error && filteredArticles.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
        >
          <UIcon
            name="i-lucide-search-x"
            class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
          />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-xs text-center">
            We couldn't find any articles matching your search or selected tags.
          </p>
          <button
            class="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20"
            @click="resetSort"
          >
            Clear all filters
          </button>
        </div>
      </div>

      <!-- Medium Section -->
      <div
        id="medium-articles"
        data-toc-section
        class="scroll-mt-20 mt-16"
      >
        <NuxtLink
          to="https://medium.com/@ofriperetzdev"
          target="_blank"
          class="group block p-8 rounded-3xl bg-gray-50/50 dark:bg-gray-800/10 border border-dashed border-gray-200 dark:border-gray-800 text-center hover:border-primary-500/50 transition-all duration-300"
        >
          <UIcon
            name="i-simple-icons-medium"
            class="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-primary-500 transition-colors"
          />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            More on Medium
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
            I also publish deep-dives on Medium. Explore my profile for more technical content and engineering leadership insights.
          </p>
          <div class="inline-flex items-center gap-2 text-sm font-bold text-primary-500 group-hover:underline">
            View Articles on Medium
            <UIcon
              name="i-lucide-external-link"
              class="w-4 h-4"
            />
          </div>
        </NuxtLink>
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
