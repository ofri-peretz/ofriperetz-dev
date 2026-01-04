<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content";

defineProps<{
  page: IndexCollectionItem;
}>();
</script>

<template>
  <UPageSection
    :title="page.about.title"
    :description="page.about.description"
    :ui="{
      container: '!p-0',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-3 text-sm sm:text-md lg:text-sm text-muted',
    }"
  >
    <template #links>
      <div class="flex justify-start mt-4">
        <ShimmerButton to="/about" size="sm">
          <span class="flex items-center gap-2">
            Learn more about me
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </span>
        </ShimmerButton>
      </div>
    </template>
  </UPageSection>
</template>
