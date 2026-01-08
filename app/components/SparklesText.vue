<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    sparklesCount?: number
    colors?: { first: string, second: string }
  }>(),
  {
    sparklesCount: 10,
    colors: () => ({ first: '#A07CFE', second: '#FE8FB5' })
  }
)

interface Sparkle {
  id: string
  x: string
  y: string
  color: string
  delay: number
  scale: number
  lifespan: number
}

const sparkles = ref<Sparkle[]>([])
const containerRef = ref<HTMLElement | null>(null)

const generateSparkle = (): Sparkle => {
  return {
    id: Math.random().toString(36).slice(2),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color: Math.random() > 0.5 ? props.colors.first : props.colors.second,
    delay: Math.random() * 2,
    scale: 0.5 + Math.random() * 0.5,
    lifespan: 1.5 + Math.random() * 1.5
  }
}

onMounted(() => {
  // Initial sparkles
  sparkles.value = Array.from({ length: props.sparklesCount }, generateSparkle)

  // Continuously regenerate sparkles
  const interval = setInterval(() => {
    sparkles.value = sparkles.value.map(() => generateSparkle())
  }, 3000)

  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <span
    ref="containerRef"
    class="relative inline-block"
  >
    <!-- Sparkles -->
    <span
      v-for="sparkle in sparkles"
      :key="sparkle.id"
      class="absolute pointer-events-none animate-sparkle"
      :style="{
        left: sparkle.x,
        top: sparkle.y,
        animationDelay: `${sparkle.delay}s`,
        animationDuration: `${sparkle.lifespan}s`,
        transform: `scale(${sparkle.scale})`
      }"
    >
      <svg
        class="w-3 h-3"
        viewBox="0 0 160 160"
        fill="none"
      >
        <path
          d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
          :fill="sparkle.color"
        />
      </svg>
    </span>

    <!-- Content -->
    <span class="relative z-10">
      <slot />
    </span>
  </span>
</template>

<style>
@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}
</style>
