<script setup lang="ts">
/**
 * AuroraText - Animated gradient text with shifting aurora effect
 * Vue port of Magic UI's aurora-text component
 */
withDefaults(
  defineProps<{
    colors?: string[]
    speed?: number
  }>(),
  {
    colors: () => ['#FF0080', '#7928CA', '#0070F3', '#38bdf8'],
    speed: 1
  }
)
</script>

<template>
  <span
    class="aurora-text relative inline-block bg-clip-text text-transparent"
    :style="{
      backgroundImage: `linear-gradient(90deg, ${colors.join(', ')}, ${colors[0]})`,
      backgroundSize: '300% 100%',
      animationDuration: `${4 / speed}s`
    }"
  >
    <slot />
  </span>
</template>

<style>
.aurora-text {
  animation: aurora-shift 4s ease-in-out infinite;
}

@keyframes aurora-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
