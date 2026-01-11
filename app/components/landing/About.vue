<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

defineProps<{
  page: IndexCollectionItem
}>()
</script>

<template>
  <div
    id="about"
    class="scroll-mt-20"
  >
    <div class="mb-4">
      <a
        href="#about"
        class="group inline-flex items-center gap-2 hover:text-primary-500 transition-colors"
      >
        <span class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ page.about.title }}</span>
        <UIcon
          name="i-lucide-link"
          class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </a>
    </div>
    <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
      {{ page.about.description }}
    </p>
  </div>
</template>
