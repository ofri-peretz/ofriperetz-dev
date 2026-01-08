<script setup lang="ts">
withDefaults(
  defineProps<{
    duration?: number
    borderWidth?: number
    colorFrom?: string
    colorTo?: string
  }>(),
  {
    duration: 6,
    borderWidth: 2,
    colorFrom: '#ffaa40',
    colorTo: '#9c40ff'
  }
)
</script>

<template>
  <div class="relative overflow-hidden rounded-xl">
    <!-- Animated border beam -->
    <div
      class="absolute inset-0 rounded-xl"
      :style="{
        'padding': `${borderWidth}px`,
        'background': `linear-gradient(var(--angle), ${colorFrom}, ${colorTo}, ${colorFrom})`,
        'animation': `rotate ${duration}s linear infinite`,
        '--angle': '0deg'
      }"
    >
      <div
        class="absolute inset-0 rounded-xl bg-background"
        :style="{ margin: `${borderWidth}px` }"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 bg-background rounded-xl">
      <slot />
    </div>
  </div>
</template>

<style>
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate {
  from {
    --angle: 0deg;
  }
  to {
    --angle: 360deg;
  }
}

.bg-background {
  background-color: var(--ui-bg);
}
</style>
