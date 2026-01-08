<script setup lang="ts">
defineProps<{
  page: {
    blog?: {
      title: string
      description: string
    }
  }
}>()

const { articles, loading, fetchArticles } = useDevToArticles()

onMounted(() => {
  fetchArticles('ofri-peretz', 3)
})
</script>

<template>
  <UPageSection
    v-if="page.blog"
    id="latest-articles"
    class="scroll-mt-20"
  >
    <div class="text-center mb-4">
      <a
        href="#latest-articles"
        class="group inline-flex items-center gap-2 hover:text-primary-500 transition-colors"
      >
        <h2
          class="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors"
        >
          {{ page.blog.title }}
        </h2>
        <UIcon
          name="i-lucide-link"
          class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-2"
        />
      </a>
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        {{ page.blog.description }}
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center py-4"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-6 h-6 animate-spin text-primary-500"
      />
    </div>

    <!-- Articles Grid -->
    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <DevToArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>

    <!-- View More -->
    <div class="text-center mt-4">
      <ShimmerButton>
        <NuxtLink
          to="/articles"
          class="flex items-center gap-2"
        >
          View All Articles
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4"
          />
        </NuxtLink>
      </ShimmerButton>
    </div>
  </UPageSection>
</template>
