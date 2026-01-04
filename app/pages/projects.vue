<script setup lang="ts">
const { data: page } = await useAsyncData("projects-page", () => {
  return queryCollection("pages").path("/projects").first();
});
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const { data: projects } = await useAsyncData("projects", () => {
  return queryCollection("projects").all();
});

const { global } = useAppConfig();

// Pagination
const currentPage = ref(1);
const itemsPerPage = 6;

const totalPages = computed(() =>
  Math.ceil((projects.value?.length || 0) / itemsPerPage),
);

const paginatedProjects = computed(() => {
  if (!projects.value) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return projects.value.slice(start, end);
});

const goToPage = (page: number) => {
  currentPage.value = page;
  // Scroll to top of projects section
  window.scrollTo({ top: 400, behavior: "smooth" });
};

useSeoMeta({
  title: "Open Source Projects - Ofri Peretz | Interlace ESLint Ecosystem",
  description:
    "Explore 35+ open source repositories including the Interlace ESLint Ecosystem with 16+ packages and 9,000+ npm downloads.",
  ogTitle: "Open Source Projects - Ofri Peretz",
  ogDescription:
    "35+ repos including 16+ npm packages with 9K+ downloads. Security-focused ESLint ecosystem.",
  ogImage: "https://ofriperetz.dev/og-projects.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: "website",
  ogUrl: "https://ofriperetz.dev/projects",
  twitterCard: "summary_large_image",
  twitterImage: "https://ofriperetz.dev/og-projects.png",
  twitterTitle: "Open Source Projects - Ofri Peretz",
  twitterDescription:
    "35+ repos including 16+ npm packages with 9K+ downloads.",
});
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :description="page.description"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start',
      }"
    >
      <template #title>
        <BlurFade :delay="0">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold">
            <GradientText animate>{{ page.title }}</GradientText>
          </h1>
        </BlurFade>
      </template>

      <template #links>
        <BlurFade :delay="100">
          <div class="flex flex-wrap items-center gap-3 mt-6">
            <ShimmerButton>
              <NuxtLink
                to="https://github.com/ofri-peretz/eslint"
                target="_blank"
                class="flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-github" class="w-4 h-4" />
                View on GitHub
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
                <UIcon name="i-simple-icons-npm" class="w-4 h-4" />
                View on NPM
                <UIcon
                  name="i-lucide-external-link"
                  class="w-3 h-3 opacity-60"
                />
              </NuxtLink>
            </ShimmerButton>
          </div>
        </BlurFade>
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0',
      }"
    >
      <Transition name="fade" mode="out-in">
        <div :key="currentPage">
          <Motion
            v-for="(project, index) in paginatedProjects"
            :key="project.title"
            :initial="{ opacity: 0, transform: 'translateY(10px)' }"
            :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
            :transition="{ delay: 0.1 * index }"
            :in-view-options="{ once: true }"
          >
            <UPageCard
              :title="project.title"
              :description="project.description"
              :to="project.url"
              orientation="horizontal"
              variant="naked"
              :reverse="index % 2 === 1"
              class="group"
              :ui="{
                wrapper: 'max-sm:order-last',
              }"
            >
              <template #leading>
                <span class="text-sm text-muted">
                  {{ new Date(project.date).getFullYear() }}
                </span>
              </template>
              <template #footer>
                <ULink
                  :to="project.url"
                  class="text-sm text-primary flex items-center"
                >
                  View Project
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </ULink>
              </template>
              <img
                :src="project.image"
                :alt="project.title"
                class="object-cover w-full h-48 rounded-lg"
              />
            </UPageCard>
          </Motion>
        </div>
      </Transition>

      <!-- Pagination Controls -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center gap-2 mt-12"
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            class="w-10 h-10 rounded-lg font-medium transition-all"
            :class="
              page === currentPage
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            "
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
        </button>
      </div>

      <!-- More Projects Coming Soon -->
      <BlurFade :delay="300">
        <div class="mt-16 text-center">
          <div
            class="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <div
              class="flex items-center gap-2 text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-lucide-package" class="w-5 h-5" />
              <span class="text-sm font-medium"
                >More packages in the ecosystem</span
              >
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              10+ More ESLint Plugins Available
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              Including eslint-plugin-pg, eslint-plugin-vercel-ai-security,
              eslint-plugin-express-security, eslint-plugin-lambda-security, and
              more.
            </p>
            <div class="flex flex-wrap gap-3 justify-center mt-2">
              <ShimmerButton>
                <NuxtLink
                  to="https://github.com/ofri-peretz/eslint"
                  target="_blank"
                  class="flex items-center gap-2"
                >
                  <UIcon name="i-simple-icons-github" class="w-4 h-4" />
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
                  <UIcon name="i-simple-icons-npm" class="w-4 h-4" />
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
    </UPageSection>
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
