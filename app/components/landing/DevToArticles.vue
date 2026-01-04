<script setup lang="ts">
defineProps<{
  page: {
    blog?: {
      title: string;
      description: string;
    };
  };
}>();

const { articles, loading, fetchArticles } = useDevToArticles();

onMounted(() => {
  fetchArticles("ofri-peretz", 3);
});
</script>

<template>
  <UPageSection v-if="page.blog">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {{ page.blog.title }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ page.blog.description }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon
        name="i-lucide-loader-2"
        class="w-6 h-6 animate-spin text-primary-500"
      />
    </div>

    <!-- Articles Grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <DevToArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>

    <!-- View More -->
    <div class="text-center mt-8">
      <UButton
        to="/articles"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-right"
      >
        View All Articles
      </UButton>
    </div>
  </UPageSection>
</template>
