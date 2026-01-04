<script setup lang="ts">
const { footer } = useAppConfig();
</script>

<template>
  <UFooter class="z-10 bg-default" :ui="{ left: 'text-muted text-xs' }">
    <template #left>
      {{ footer.credits }}
    </template>

    <!-- Center: Let's Talk CTA above social icons -->
    <template #center>
      <div class="flex flex-col items-center gap-3">
        <LinkedInCTA />
      </div>
    </template>

    <template #right>
      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
