<script setup lang="ts"></script>

<template>
  <div class="relative">
    <!-- Floating background logos -->
    <FloatingLogo />

    <UContainer class="sm:border-x border-default pt-10 relative z-10">
      <AppHeader :links="navLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
