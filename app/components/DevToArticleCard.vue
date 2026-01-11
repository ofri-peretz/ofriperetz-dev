<script setup lang="ts">
import type { DevToArticle } from '~/composables/useDevToArticles'

defineProps<{
  article: DevToArticle
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <a
    :href="article.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group block h-full"
  >
    <div class="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 flex flex-col relative focus-within:ring-2 focus-within:ring-violet-500/50 outline-none">

      <!-- SECTION 1: THUMBNAIL IMAGE -->
      <div class="relative h-52 w-full shrink-0 overflow-hidden">
        <template v-if="article.cover_image || article.social_image">
          <NuxtImg
            :src="article.cover_image || article.social_image"
            :alt="article.title"
            loading="lazy"
            decoding="async"
            format="webp"
            quality="80"
            class="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          />
        </template>
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8 text-center"
        >
          <span class="text-xl sm:text-2xl font-black text-white leading-tight tracking-tighter drop-shadow-lg">
            {{ article.title }}
          </span>
        </div>
        <div class="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded backdrop-blur-md ring-1 ring-white/20">
          DEV.TO
        </div>
      </div>

      <!-- SECTION 2: AUTHOR ROW - PREMIUM STYLE -->
      <div class="py-3 px-6 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50 w-full">
        <div class="flex items-center gap-3">
          <NuxtImg
            :src="article.user.profile_image"
            :alt="article.user.username"
            class="size-8 rounded-full shrink-0 ring-2 ring-violet-500/20 shadow-sm"
          />
          <span class="text-sm font-bold text-gray-900 dark:text-white">
            {{ article.user.name }}
          </span>
        </div>
        <span
          :title="`Published: ${article.published_at}`"
          class="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-200/30 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg shrink-0 cursor-help border border-gray-200/50 dark:border-gray-700/50"
        >
          {{ formatDate(article.published_at) }}
        </span>
      </div>

      <!-- SECTION 3: CONTENT BODY -->
      <div class="p-6 flex-grow flex flex-col">
        <!-- Title & Description -->
        <div class="flex-grow">
          <h3 class="text-xl font-black text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors line-clamp-2 leading-tight tracking-tighter min-h-[3rem]">
            {{ article.title }}
          </h3>
          <p
            v-if="article.description"
            class="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed opacity-90"
          >
            {{ article.description }}
          </p>
        </div>

        <!-- Tags at bottom of content block -->
        <div class="flex flex-wrap gap-2 mt-4">
          <span
            v-for="tag in article.tag_list.slice(0, 3)"
            :key="tag"
            class="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-600/5 dark:bg-violet-400/5 border border-violet-500/10 rounded-md"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- SECTION 4: STATS - LUXURY HUD STYLE -->
      <div class="px-6 py-4 flex items-center justify-between gap-2 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/10 w-full group-hover:bg-violet-500/5 transition-colors">
        <div class="flex items-center gap-4 sm:gap-6 justify-evenly w-full">
          <span
            title="Reactions"
            class="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors cursor-help"
          >
            <UIcon
              name="i-lucide-heart"
              class="w-3.5 h-3.5"
            />
            {{ article.positive_reactions_count }}
          </span>
          <span
            title="Comments"
            class="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors cursor-help"
          >
            <UIcon
              name="i-lucide-message-circle"
              class="w-3.5 h-3.5"
            />
            {{ article.comments_count }}
          </span>
          <span
            v-if="article.page_views_count !== undefined"
            title="Views"
            class="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-green-500 transition-colors cursor-help"
          >
            <UIcon
              name="i-lucide-eye"
              class="w-3.5 h-3.5"
            />
            {{ article.page_views_count.toLocaleString() }}
          </span>
          <span
            title="Reading Duration"
            class="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 transition-colors cursor-help"
          >
            <UIcon
              name="i-lucide-clock"
              class="w-3.5 h-3.5"
            />
            {{ article.reading_time_minutes }}m
          </span>
        </div>
      </div>

      <!-- INTERACTION GLOW -->
      <div
        class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  </a>
</template>
