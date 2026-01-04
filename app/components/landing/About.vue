<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content";

defineProps<{
  page: IndexCollectionItem;
}>();
</script>

<template>
  <UPageSection
    id="about"
    class="scroll-mt-20"
    :ui="{
      container: '!p-0',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-3 text-sm sm:text-md lg:text-sm text-muted',
    }"
  >
    <template #title>
      <a
        href="#about"
        class="group inline-flex items-center gap-2 hover:text-primary-500 transition-colors"
      >
        {{ page.about.title }}
        <UIcon
          name="i-lucide-link"
          class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </a>
    </template>
    <template #description>
      {{ page.about.description }}
    </template>
    <template #links>
      <div class="flex justify-start mt-4">
        <ShimmerButton>
          <NuxtLink to="/about" class="flex items-center gap-2">
            Learn more about me
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </ShimmerButton>
      </div>
    </template>
  </UPageSection>
</template>
