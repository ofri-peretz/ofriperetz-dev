<script setup lang="ts">
/**
 * ShinyText - Animated shimmer/glare effect
 * Vue port of Magic UI's animated-shiny-text component
 */
withDefaults(
  defineProps<{
    shimmerWidth?: number
    speed?: number
  }>(),
  {
    shimmerWidth: 100,
    speed: 1
  }
)
</script>

<template>
  <span
    class="shiny-text relative inline-block bg-clip-text"
    :style="{
      '--shimmer-width': `${shimmerWidth}px`,
      'animationDuration': `${3 / speed}s`
    }"
  >
    <slot />
  </span>
</template>

<style>
.shiny-text {
  background: linear-gradient(
    90deg,
    currentColor 0%,
    currentColor 40%,
    rgba(255, 255, 255, 0.9) 50%,
    currentColor 60%,
    currentColor 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: -100% 50%;
  }
}
</style>
