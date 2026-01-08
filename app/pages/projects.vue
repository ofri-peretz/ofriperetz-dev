<script setup lang="ts">
const { data: page } = await useAsyncData('projects-page', () => {
  return queryCollection('pages').path('/projects').first()
})
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

const { data: projects } = await useAsyncData('projects', () => {
  return queryCollection('projects').all()
})

const { global: _global } = useAppConfig()

// View mode: 1, 2, or 3 columns
const viewMode = ref(2)

// Get available view modes based on screen size
const { width } = useWindowSize()
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
      return 'grid-cols-1 md:grid-cols-2'
    case 3:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    default:
      return 'grid-cols-1 md:grid-cols-2'
  }
})

// Pagination (URL-synced for deep linking)
const route = useRoute()
const router = useRouter()

// Read initial page from URL query param
const initialPage = computed(() => {
  const pageParam = route.query.page
  const parsed = parseInt(pageParam as string, 10)
  return !isNaN(parsed) && parsed >= 1 ? parsed : 1
})

const currentPage = ref(initialPage.value)
const itemsPerPage = 6

// Sync URL when page changes
watch(currentPage, (newPage) => {
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
      currentPage.value = parsed
    } else if (!newPage) {
      currentPage.value = 1
    }
  }
)

const totalPages = computed(() =>
  Math.ceil((projects.value?.length || 0) / itemsPerPage)
)

const paginatedProjects = computed(() => {
  if (!projects.value) return []
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return projects.value.slice(start, end)
})

const goToPage = (page: number) => {
  currentPage.value = page
  // Scroll to top of controls section
  const section = document.getElementById('projects-controls')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

useSeoMeta({
  title: 'Open Source Projects - Ofri Peretz | Interlace ESLint Ecosystem',
  description:
    'Explore 35+ open source repositories including the Interlace ESLint Ecosystem with 16+ packages and 9,000+ npm downloads.',
  ogTitle: 'Open Source Projects - Ofri Peretz',
  ogDescription:
    '35+ repos including 16+ npm packages with 9K+ downloads. Security-focused ESLint ecosystem.',
  ogImage: 'https://ofriperetz.dev/og-projects.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: 'website',
  ogUrl: 'https://ofriperetz.dev/projects',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://ofriperetz.dev/og-projects.png',
  twitterTitle: 'Open Source Projects - Ofri Peretz',
  twitterDescription:
    '35+ repos including 16+ npm packages with 9K+ downloads.'
})

// TOC items for projects page
const tocItems = [
  { id: 'projects-hero', label: 'Overview' },
  { id: 'projects-grid', label: 'Projects' },
  { id: 'more-projects', label: 'More Packages' }
]
</script>

<template>
  <UPage v-if="page">
    <!-- Floating TOC -->
    <FloatingToc :items="tocItems" />

    <div
      id="projects-hero"
      data-toc-section
      class="scroll-mt-20"
    >
      <UPageHero
        :description="page.description"
        :ui="{
          title: '!mx-0 text-left',
          description: '!mx-0 text-left',
          links: 'justify-center'
        }"
      >
        <template #title>
          <BlurFade :delay="0">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <GradientText animate>
                {{ page.title }}
              </GradientText>
            </h1>
          </BlurFade>
        </template>
      </UPageHero>
    </div>
    <div
      id="projects-grid"
      data-toc-section
      class="scroll-mt-20"
    >
      <UPageSection
        :ui="{
          container: '!pt-0'
        }"
      >
        <!-- Controls Row: Pagination + View -->
        <div
          id="projects-controls"
          class="flex flex-wrap items-center justify-between gap-4 mb-6 scroll-mt-20"
        >
          <!-- Pagination Controls (left) -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Page:</span>
            <div class="flex items-center gap-1">
              <button
                :disabled="currentPage === 1"
                class="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                @click="goToPage(currentPage - 1)"
              >
                <UIcon
                  name="i-lucide-chevron-left"
                  class="w-4 h-4"
                />
              </button>

              <div class="flex gap-1">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  class="w-8 h-8 rounded-lg font-medium text-sm transition-all"
                  :class="
                    page === currentPage
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  "
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>

              <button
                :disabled="currentPage === totalPages"
                class="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                @click="goToPage(currentPage + 1)"
              >
                <UIcon
                  name="i-lucide-chevron-right"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>

          <!-- View Mode Toggle (right) -->
          <div class="flex items-center gap-2">
            <span
              class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline"
            >View:</span>
            <div
              class="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              <button
                v-for="mode in availableViewModes"
                :key="mode"
                class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
                :class="
                  viewMode === mode
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                "
                @click="viewMode = mode"
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

        <Transition
          name="fade"
          mode="out-in"
        >
          <div
            id="projects-grid"
            :key="`${currentPage}-${viewMode}`"
            class="grid gap-6 scroll-mt-20"
            :class="gridClass"
          >
            <Motion
              v-for="(project, index) in paginatedProjects"
              :key="project.title"
              :initial="{ opacity: 0, transform: 'translateY(10px)' }"
              :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
              :transition="{ delay: 0.1 * index }"
              :in-view-options="{ once: true }"
            >
              <NuxtLink
                :to="project.url"
                target="_blank"
                class="group block h-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 flex flex-col"
              >
                <!-- Image -->
                <div class="relative overflow-hidden flex-shrink-0">
                  <img
                    :src="project.image"
                    :alt="project.title"
                    class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  >
                  <div class="absolute top-3 left-3">
                    <span
                      class="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-md"
                    >
                      2025
                    </span>
                  </div>
                  <div class="absolute top-3 right-3">
                    <UIcon
                      name="i-lucide-external-link"
                      class="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                <!-- Content -->
                <div class="p-5 flex flex-col flex-grow">
                  <h3
                    class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors line-clamp-2"
                  >
                    {{ project.title }}
                  </h3>
                  <p
                    class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow"
                  >
                    {{ project.description }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-auto">
                    <span
                      v-for="tag in project.tags?.slice(0, 3)"
                      :key="tag"
                      class="px-2 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </Motion>
          </div>
        </Transition>

        <!-- Pagination Controls -->
        <div
          v-if="totalPages > 1"
          class="flex justify-center items-center gap-2 mt-12"
        >
          <button
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(currentPage - 1)"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="w-4 h-4"
            />
          </button>

          <div class="flex gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              class="w-10 h-10 rounded-lg font-medium transition-all"
              :class="
                page === currentPage
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              "
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(currentPage + 1)"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="w-4 h-4"
            />
          </button>
        </div>

        <!-- More Projects Coming Soon -->
        <BlurFade :delay="300">
          <div
            id="more-projects"
            data-toc-section
            class="mt-16 scroll-mt-20"
          >
            <div
              class="flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700"
            >
              <div
                class="flex items-center gap-2 text-gray-500 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-package"
                  class="w-5 h-5"
                />
                <span class="text-sm font-medium">More packages in the ecosystem</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                10+ More ESLint Plugins Available
              </h3>
              <p
                class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-2xl"
              >
                Including eslint-plugin-pg, eslint-plugin-vercel-ai-security,
                eslint-plugin-express-security, eslint-plugin-lambda-security,
                and more.
              </p>
              <div class="flex flex-wrap gap-3 justify-center mt-2">
                <ShimmerButton>
                  <NuxtLink
                    to="https://github.com/ofri-peretz"
                    target="_blank"
                    class="flex items-center gap-2"
                  >
                    <UIcon
                      name="i-simple-icons-github"
                      class="w-4 h-4"
                    />
                    Explore All Packages
                    <UIcon
                      name="i-lucide-external-link"
                      class="w-3 h-3 opacity-60"
                    />
                  </NuxtLink>
                </ShimmerButton>
                <ShimmerButton>
                  <NuxtLink
                    to="https://www.npmjs.com/~ofriperetz"
                    target="_blank"
                    class="flex items-center gap-2"
                  >
                    <UIcon
                      name="i-simple-icons-npm"
                      class="w-4 h-4"
                    />
                    View on npm
                    <UIcon
                      name="i-lucide-external-link"
                      class="w-3 h-3 opacity-60"
                    />
                  </NuxtLink>
                </ShimmerButton>
              </div>
            </div>
          </div>
        </BlurFade>

        <!-- Package Stats Preview -->
        <BlurFade :delay="350">
          <div class="mt-8 max-w-md mx-auto">
            <LandingStatsPreviewDownloads />
          </div>
        </BlurFade>
      </UPageSection>
    </div>
  </UPage>
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
