<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content";

defineProps<{
  page: IndexCollectionItem;
}>();
</script>

<template>
  <UPageSection
    :title="page.experience.title"
    :ui="{
      container: '!p-0 gap-4 sm:gap-4',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'mt-2',
    }"
  >
    <template #description>
      <div class="flex flex-col gap-3">
        <Motion
          v-for="(experience, index) in page.experience.items"
          :key="index"
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.4 + 0.15 * index }"
          :in-view-options="{ once: true }"
          class="group"
        >
          <div class="text-muted flex items-center flex-wrap gap-2">
            <p class="text-sm whitespace-nowrap">
              {{ experience.date }}
            </p>
            <USeparator class="hidden sm:block" />
            <ULink
              class="flex items-center gap-1 flex-wrap"
              :to="experience.company.url"
              target="_blank"
            >
              <span class="text-sm">
                {{ experience.position }}
              </span>
              <div
                class="inline-flex items-center gap-1"
                :style="{ color: experience.company.color }"
              >
                <span class="font-medium">{{ experience.company.name }}</span>
                <UIcon :name="experience.company.logo" />
              </div>
            </ULink>
          </div>
          <!-- Highlights -->
          <div
            v-if="experience.highlights?.length"
            class="ml-0 sm:ml-4 mt-1 flex flex-wrap gap-x-3 gap-y-1"
          >
            <span
              v-for="highlight in experience.highlights"
              :key="highlight"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              • {{ highlight }}
            </span>
          </div>
        </Motion>
      </div>
    </template>
  </UPageSection>
</template>

<style scoped></style>
