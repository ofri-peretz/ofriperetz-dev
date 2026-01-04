<script setup lang="ts">
const { articles, loading, error, fetchArticles } = useDevToArticles();

// Fetch articles on mount
onMounted(() => {
  fetchArticles("ofri-peretz", 12);
});

useSeoMeta({
  title: "Articles - Ofri Peretz",
  description:
    "Technical articles on security, ESLint, and AI-native development by Ofri Peretz. Published on dev.to.",
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
          development. All articles are published on dev.to and auto-synced
          here.
        </p>
        <div class="mt-6">
          <UButton
            to="https://dev.to/ofri-peretz"
            target="_blank"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-devdotto"
          >
            Follow on dev.to
          </UButton>
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
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <div v-if="articles.length > 0" class="text-center mt-12">
        <UButton
          to="https://dev.to/ofri-peretz"
          target="_blank"
          color="primary"
          size="lg"
          trailing-icon="i-lucide-external-link"
        >
          View All Articles on dev.to
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
