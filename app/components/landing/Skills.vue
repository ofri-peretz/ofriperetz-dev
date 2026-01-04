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
  <UPageSection v-if="page.skills">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ page.skills.title }}
      </h2>
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
