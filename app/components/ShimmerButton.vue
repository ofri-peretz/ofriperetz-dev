<script setup lang="ts">
defineProps<{
  shimmerColor?: string;
  shimmerSize?: string;
}>();
</script>

<template>
  <button
    class="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 font-medium text-white transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30 active:scale-95"
  >
    <!-- Shimmer effect -->
    <span class="absolute inset-0 overflow-hidden rounded-xl">
      <span
        class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </span>

    <!-- Content -->
    <span class="relative flex items-center gap-2">
      <slot />
    </span>
  </button>
</template>

<style>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
