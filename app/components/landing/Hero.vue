<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

const { footer, global } = useAppConfig()

defineProps<{
  page: IndexCollectionItem
}>()
</script>

<template>
  <UPageHero
    :ui="{
      headline: 'flex items-center justify-center',
      title: 'text-shadow-md max-w-lg mx-auto',
      links: 'mt-4 flex-col justify-center items-center'
    }"
  >
    <template #headline>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1
        }"
      >
        <img
          class="size-28 sm:size-32 rounded-full ring-4 ring-primary-500/30 ring-offset-4 ring-offset-(--ui-bg) shadow-xl object-cover"
          :src="global.picture?.light!"
          :alt="global.picture?.alt!"
          loading="eager"
          fetchpriority="high"
        >
      </Motion>
    </template>

    <template #title>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1
        }"
      >
        <SparklesText :sparkles-count="8">
          <AuroraText
            :colors="['#FF0080', '#7928CA', '#0070F3', '#38bdf8']"
            :speed="0.8"
          >
            {{ page.title }}
          </AuroraText>
        </SparklesText>
      </Motion>
    </template>

    <template #description>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3
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
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.5
        }"
      >
        <div
          v-if="page.hero?.links"
          class="flex flex-wrap items-center justify-center gap-3 w-full"
        >
          <!-- Elegant ghost CTAs for each section -->
          <NuxtLink
            to="/projects"
            class="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-primary-400 transition-all duration-300 rounded-full border border-transparent hover:border-primary-500/30 hover:bg-primary-500/5"
          >
            <UIcon
              name="i-lucide-folder-open"
              class="w-4 h-4 group-hover:scale-110 transition-transform"
            />
            Projects
          </NuxtLink>
          <NuxtLink
            to="/articles"
            class="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-purple-400 transition-all duration-300 rounded-full border border-transparent hover:border-purple-500/30 hover:bg-purple-500/5"
          >
            <UIcon
              name="i-simple-icons-devdotto"
              class="w-4 h-4 group-hover:scale-110 transition-transform"
            />
            Articles
          </NuxtLink>
          <NuxtLink
            to="/stats"
            class="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-yellow-400 transition-all duration-300 rounded-full border border-transparent hover:border-yellow-500/30 hover:bg-yellow-500/5"
          >
            <UIcon
              name="i-lucide-bar-chart-2"
              class="w-4 h-4 group-hover:scale-110 transition-transform"
            />
            Impact
          </NuxtLink>

          <!-- Availability status -->
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
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.7
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
            filter: 'blur(20px)'
          }"
          :animate="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)'
          }"
          :transition="{
            duration: 0.6,
            delay: 0.5 + index * 0.1
          }"
        >
          <UButton
            v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
          />
        </Motion>
      </div>
    </template>

    <!-- Impact Preview - in Hero section -->
    <Motion
      :initial="{ scale: 1.1, opacity: 0, filter: 'blur(20px)' }"
      :animate="{ scale: 1, opacity: 1, filter: 'blur(0px)' }"
      :transition="{ duration: 0.6, delay: 0.7 }"
      class="py-6 px-2 sm:px-8 w-full max-w-6xl mx-auto"
    >
      <LandingImpactPreview />
    </Motion>
  </UPageHero>
</template>
