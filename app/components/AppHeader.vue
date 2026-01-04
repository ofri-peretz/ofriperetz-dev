<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

defineProps<{
  links: NavigationMenuItem[];
}>();

// Mobile menu state
const mobileMenuOpen = ref(false);
</script>

<template>
  <div
    class="fixed top-2 sm:top-4 mx-auto left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-auto max-w-[95vw]"
  >
    <!-- Desktop Navigation -->
    <UNavigationMenu
      :items="links"
      variant="link"
      color="neutral"
      class="hidden sm:flex bg-muted/80 backdrop-blur-sm rounded-full px-2 sm:px-4 border border-muted/50 shadow-lg shadow-neutral-950/5"
      :ui="{
        link: 'px-2 py-1',
        linkLeadingIcon: 'hidden',
      }"
    >
      <template #list-trailing>
        <ColorModeButton />
      </template>
    </UNavigationMenu>

    <!-- Mobile Navigation -->
    <div
      class="sm:hidden flex items-center justify-between bg-muted/90 backdrop-blur-md rounded-full px-4 py-2 border border-muted/50 shadow-lg"
    >
      <span class="font-semibold text-sm">Ofri Peretz</span>
      <div class="flex items-center gap-2">
        <ColorModeButton />
        <UButton
          :icon="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="mobileMenuOpen = !mobileMenuOpen"
        />
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="sm:hidden mt-2 bg-muted/95 backdrop-blur-md rounded-2xl border border-muted/50 shadow-xl p-4"
      >
        <nav class="flex flex-col gap-1">
          <NuxtLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="px-4 py-3 rounded-xl text-sm font-medium hover:bg-primary-500/10 transition-colors"
            active-class="bg-primary-500/20 text-primary-500"
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </div>
</template>
