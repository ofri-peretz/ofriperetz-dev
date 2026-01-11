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
  fetchArticles('ofri-peretz', 9)
})
</script>

<template>
  <div v-if="page.blog">
    <UContainer>
      <div class="text-center mb-10">
        <a
          href="#latest-articles"
          class="group inline-flex items-center gap-2 hover:text-primary-500 transition-colors"
        >
          <h2
            class="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors"
          >
            {{ page.blog.title }}
          </h2>
          <UIcon
            name="i-lucide-link"
            class="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-2"
          />
        </a>
        <p class="text-gray-600 dark:text-gray-400 text-sm max-w-2xl mx-auto">
          {{ page.blog.description }}
        </p>
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

      <!-- Articles Grid -->
      <div
        v-else
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <DevToArticleCard
          v-for="(article, index) in articles.slice(0, 9)"
          :key="article.id"
          :article="article"
          :class="[
            index >= 3 ? 'hidden sm:flex' : 'flex',
            index >= 4 ? 'sm:hidden lg:flex' : ''
          ]"
        />
      </div>

      <!-- View More CTA -->
      <div class="mt-12 flex justify-center">
        <NuxtLink
          to="/articles"
          class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary-600 dark:bg-primary-500/10 border border-primary-600/20 dark:border-primary-500/30 text-sm font-bold text-white dark:text-primary-400 hover:bg-primary-700 dark:hover:bg-primary-500/20 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary-500/10"
        >
          Explore All Articles
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4"
          />
        </NuxtLink>
      </div>
    </UContainer>
  </div>
</template>
