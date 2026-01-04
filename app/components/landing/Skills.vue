<script setup lang="ts">
defineProps<{
  page: {
    skills?: {
      title: string;
      categories: Array<{
        name: string;
        items: string[];
      }>;
    };
  };
}>();
</script>

<template>
  <UPageSection v-if="page.skills" id="skills" class="scroll-mt-20">
    <div class="text-center mb-8">
      <a
        href="#skills"
        class="group inline-flex items-center gap-2 hover:text-primary-500 transition-colors"
      >
        <h2
          class="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors"
        >
          {{ page.skills.title }}
        </h2>
        <UIcon
          name="i-lucide-link"
          class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </a>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="category in page.skills.categories"
        :key="category.name"
        class="hover:shadow-lg transition-shadow"
      >
        <div class="space-y-3">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ category.name }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="skill in category.items"
              :key="skill"
              color="primary"
              variant="subtle"
              size="sm"
            >
              {{ skill }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </UPageSection>
</template>
