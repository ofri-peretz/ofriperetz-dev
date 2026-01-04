<script setup lang="ts">
defineProps<{
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
}>();
</script>

<template>
  <span
    class="bg-clip-text text-transparent bg-gradient-to-r"
    :class="[
      from || 'from-primary-500',
      via || 'via-purple-500',
      to || 'to-pink-500',
      animate ? 'animate-gradient bg-[length:200%_auto]' : '',
    ]"
  >
    <slot />
  </span>
</template>

<style>
@keyframes gradient {
  0%,
  100% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
}

.animate-gradient {
  animation: gradient 3s ease-in-out infinite;
}
</style>
