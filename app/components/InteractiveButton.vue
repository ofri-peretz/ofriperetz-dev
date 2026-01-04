<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>

<template>
  <button
    class="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 font-medium text-gray-900 dark:text-white transition-all duration-300 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
  >
    <!-- Default text that slides up on hover -->
    <span
      class="relative flex items-center gap-2 transition-transform duration-300 group-hover:-translate-y-full group-hover:opacity-0"
    >
      <slot>{{ text }}</slot>
    </span>

    <!-- Hover text that slides in from bottom -->
    <span
      class="absolute inset-0 flex items-center justify-center gap-2 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 text-primary-600 dark:text-primary-400"
    >
      <slot name="hover">
        <slot>{{ text }}</slot>
      </slot>
      <UIcon
        name="i-lucide-arrow-right"
        class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
      />
    </span>

    <!-- Gradient overlay on hover -->
    <span
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-500/5 via-primary-500/10 to-primary-500/5 pointer-events-none"
    />
  </button>
</template>
