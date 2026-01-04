<script setup lang="ts"></script>

<template>
  <div class="relative min-h-screen">
    <!-- Animated background -->
    <AnimatedBackground />

    <UContainer class="sm:border-x border-default pt-10 relative z-10">
      <AppHeader :links="navLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
