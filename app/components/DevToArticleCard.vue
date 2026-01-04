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
  <a
    :href="article.url"
    target="_blank"
    rel="noopener noreferrer"
    class="block"
  >
    <UCard
      class="group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300 hover:shadow-xl cursor-pointer h-full"
    >
      <!-- Cover Image -->
      <template v-if="article.cover_image || article.social_image" #header>
        <div class="relative overflow-hidden h-48">
          <img
            :src="article.cover_image || article.social_image"
            :alt="article.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <!-- dev.to badge with guaranteed contrast -->
          <div class="absolute top-3 left-3">
            <span
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-black/80 rounded-full shadow-lg ring-1 ring-white/20"
            >
              <UIcon name="i-simple-icons-devdotto" class="w-3 h-3" />
              dev.to
            </span>
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
          class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400"
        >
          <span class="flex items-center gap-1">
            <UIcon
              name="i-lucide-heart"
              class="w-3.5 h-3.5 text-red-500 flex-shrink-0"
            />
            {{ article.positive_reactions_count }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon
              name="i-lucide-message-circle"
              class="w-3.5 h-3.5 flex-shrink-0"
            />
            {{ article.comments_count }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5 flex-shrink-0" />
            {{ article.reading_time_minutes }}m
          </span>
          <time
            :datetime="article.published_at"
            class="ml-auto whitespace-nowrap"
          >
            {{ formatDate(article.published_at) }}
          </time>
        </div>
      </template>
    </UCard>
  </a>
</template>
