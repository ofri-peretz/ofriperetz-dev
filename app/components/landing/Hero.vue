<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content";

const { footer, global } = useAppConfig();

defineProps<{
  page: IndexCollectionItem;
}>();
</script>

<template>
  <UPageHero
    :ui="{
      headline: 'flex items-center justify-center',
      title: 'text-shadow-md max-w-lg mx-auto',
      links: 'mt-4 flex-col justify-center items-center',
    }"
  >
    <template #headline>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1,
        }"
      >
        <UColorModeAvatar
          class="size-28 sm:size-32 ring-4 ring-primary-500/30 ring-offset-4 ring-offset-(--ui-bg) shadow-xl"
          :light="global.picture?.light!"
          :dark="global.picture?.dark!"
          :alt="global.picture?.alt!"
        />
      </Motion>
    </template>

    <template #title>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1,
        }"
      >
        <GradientText animate>{{ page.title }}</GradientText>
      </Motion>
    </template>

    <template #description>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3,
        }"
      >
        {{ page.description }}
      </Motion>
    </template>

    <template #links>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.5,
        }"
      >
        <div
          v-if="page.hero?.links"
          class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <!-- Primary CTA with Magic UI shimmer effect -->
          <ShimmerButton>
            <NuxtLink
              :to="page.hero?.links?.[0]?.to"
              class="flex items-center gap-2"
            >
              <UIcon name="i-lucide-folder-open" class="w-4 h-4" />
              {{ page.hero?.links?.[0]?.label }}
            </NuxtLink>
          </ShimmerButton>
          <UButton
            :color="global.available ? 'success' : 'error'"
            variant="ghost"
            class="gap-2"
            :to="global.available ? global.meetingLink : ''"
            :label="
              global.available
                ? 'Available for new projects'
                : 'Unavailable • Full-time at Snappy'
            "
          >
            <template #leading>
              <span class="relative flex size-2">
                <span
                  class="absolute inline-flex size-full rounded-full opacity-75"
                  :class="
                    global.available ? 'bg-success animate-ping' : 'bg-error'
                  "
                />
                <span
                  class="relative inline-flex size-2 scale-90 rounded-full"
                  :class="global.available ? 'bg-success' : 'bg-error'"
                />
              </span>
            </template>
          </UButton>
        </div>
      </Motion>

      <!-- LinkedIn CTA - tracks clicks for visitor identification -->
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.7,
        }"
        class="mt-4"
      >
        <LinkedInCTA />
      </Motion>

      <div class="gap-x-4 inline-flex mt-4">
        <Motion
          v-for="(link, index) of footer?.links"
          :key="index"
          :initial="{
            scale: 1.1,
            opacity: 0,
            filter: 'blur(20px)',
          }"
          :animate="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
          }"
          :transition="{
            duration: 0.6,
            delay: 0.5 + index * 0.1,
          }"
        >
          <UButton
            v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
          />
        </Motion>
      </div>
    </template>

    <!-- Stats Widget instead of image marquee -->
    <Motion
      :initial="{ scale: 1.1, opacity: 0, filter: 'blur(20px)' }"
      :animate="{ scale: 1, opacity: 1, filter: 'blur(0px)' }"
      :transition="{ duration: 0.6, delay: 0.7 }"
      class="py-6 px-4 sm:px-8 w-full max-w-2xl mx-auto"
    >
      <h2 class="text-xl sm:text-2xl font-bold text-center mb-2">
        <GradientText>Open Source Impact</GradientText>
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
        Live metrics from my npm packages, GitHub repos, and technical articles
      </p>
      <div class="text-center mb-6">
        <UButton to="/stats" color="neutral" variant="ghost" class="gap-2">
          Check Impact Dashboard
          <template #trailing>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </template>
        </UButton>
      </div>
      <LandingStatsWidget />
    </Motion>
  </UPageHero>
</template>
