<script setup lang="ts">
import type { DevToArticle } from "~/composables/useDevToArticles";

defineProps<{
  article: DevToArticle;
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
</script>

<template>
  <UCard
    :to="article.url"
    target="_blank"
    class="group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300 hover:shadow-xl"
  >
    <!-- Cover Image -->
    <template v-if="article.cover_image || article.social_image" #header>
      <div class="relative overflow-hidden">
        <img
          :src="article.cover_image || article.social_image"
          :alt="article.title"
          class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <!-- dev.to badge -->
        <div class="absolute top-3 left-3">
          <UBadge
            color="neutral"
            variant="solid"
            class="backdrop-blur-sm bg-black/70"
          >
            <UIcon name="i-simple-icons-devdotto" class="w-3 h-3 mr-1" />
            dev.to
          </UBadge>
        </div>
      </div>
    </template>

    <!-- Content -->
    <div class="space-y-3">
      <h3
        class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2"
      >
        {{ article.title }}
      </h3>

      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {{ article.description }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1.5">
        <UBadge
          v-for="tag in article.tag_list.slice(0, 3)"
          :key="tag"
          color="primary"
          variant="subtle"
          size="xs"
        >
          #{{ tag }}
        </UBadge>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div
        class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
      >
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-heart" class="w-4 h-4 text-red-500" />
            {{ article.positive_reactions_count }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
            {{ article.comments_count }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="w-4 h-4" />
            {{ article.reading_time_minutes }} min
          </span>
        </div>
        <time :datetime="article.published_at">
          {{ formatDate(article.published_at) }}
        </time>
      </div>
    </template>
  </UCard>
</template>
