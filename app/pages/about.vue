<script setup lang="ts">
const { data: page } = await useAsyncData("about", () => {
  return queryCollection("about").first();
});
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const { global } = useAppConfig();

// Key facts for visual display
const keyFacts = [
  {
    icon: "i-lucide-users",
    label: "Built U.S. Engineering Team",
    color: "text-blue-500",
  },
  {
    icon: "i-lucide-trending-up",
    label: "Scaled APIs 100x",
    color: "text-green-500",
  },
  {
    icon: "i-lucide-package",
    label: "16+ npm Packages",
    color: "text-purple-500",
  },
  {
    icon: "i-lucide-shield-check",
    label: "200+ Security Rules",
    color: "text-red-500",
  },
];

const techStack = [
  {
    name: "TypeScript",
    icon: "i-simple-icons-typescript",
    color: "bg-blue-500",
  },
  { name: "React", icon: "i-simple-icons-react", color: "bg-cyan-500" },
  { name: "Node.js", icon: "i-simple-icons-nodedotjs", color: "bg-green-500" },
  { name: "AWS", icon: "i-simple-icons-amazonaws", color: "bg-orange-500" },
  {
    name: "PostgreSQL",
    icon: "i-simple-icons-postgresql",
    color: "bg-blue-600",
  },
  { name: "Docker", icon: "i-simple-icons-docker", color: "bg-blue-400" },
];

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  ogTitle: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description,
});
</script>

<template>
  <UPage v-if="page">
    <!-- Hero Section -->
    <BlurFade :delay="0">
      <UPageHero
        orientation="horizontal"
        :ui="{
          container: 'lg:flex sm:flex-row items-center gap-8 py-12',
          title: '!mx-0 text-left',
          description: '!mx-0 text-left',
          links: 'justify-start',
        }"
      >
        <template #title>
          <GradientText
            animate
            class="text-3xl sm:text-4xl lg:text-5xl font-bold"
          >
            {{ page.title }}
          </GradientText>
        </template>

        <template #description>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
            {{ page.description }}
          </p>
        </template>

        <UColorModeAvatar
          class="sm:rotate-4 size-32 sm:size-40 rounded-2xl ring-4 ring-primary-500/20 ring-offset-4 ring-offset-(--ui-bg) shadow-2xl"
          :light="global.picture?.light!"
          :dark="global.picture?.dark!"
          :alt="global.picture?.alt!"
        />
      </UPageHero>
    </BlurFade>

    <!-- Key Facts -->
    <BlurFade :delay="100">
      <div
        class="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-8 max-w-4xl mx-auto mb-12"
      >
        <div
          v-for="(fact, index) in keyFacts"
          :key="index"
          class="text-center p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:scale-105 transition-all duration-300 hover:shadow-lg"
        >
          <UIcon
            :name="fact.icon"
            :class="['w-8 h-8 mx-auto mb-2', fact.color]"
          />
          <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {{ fact.label }}
          </p>
        </div>
      </div>
    </BlurFade>

    <!-- Tech Stack Orbiting -->
    <BlurFade :delay="200">
      <div class="text-center mb-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          <SparklesText>Tech Stack</SparklesText>
        </h2>
        <div class="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto px-4">
          <div
            v-for="tech in techStack"
            :key="tech.name"
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-300 cursor-default"
          >
            <UIcon :name="tech.icon" class="w-5 h-5" />
            <span
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ tech.name }}</span
            >
          </div>
        </div>
      </div>
    </BlurFade>

    <!-- Main Content (Condensed) -->
    <BlurFade :delay="300">
      <UPageSection :ui="{ container: '!pt-0 max-w-3xl' }">
        <UCard>
          <div class="prose dark:prose-invert max-w-none">
            <h3 class="flex items-center gap-2 text-xl font-bold">
              <UIcon name="i-lucide-rocket" class="w-5 h-5 text-primary-500" />
              Current Focus
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Revolutionizing the ESLint ecosystem for the AI era. Building
              LLM-optimized, security-first static analysis tools through the
              <strong>Interlace ESLint Ecosystem</strong> — 16+ packages with
              200+ rules covering security, performance, and code quality.
            </p>
          </div>
        </UCard>
      </UPageSection>
    </BlurFade>

    <!-- Philosophy -->
    <BlurFade :delay="400">
      <UPageSection :ui="{ container: 'max-w-3xl' }">
        <UCard
          class="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800"
        >
          <div class="text-center">
            <UIcon
              name="i-lucide-heart"
              class="w-10 h-10 text-primary-500 mx-auto mb-4"
            />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Open Source Philosophy
            </h3>
            <p
              class="text-gray-600 dark:text-gray-400 text-sm max-w-lg mx-auto"
            >
              I believe open source is the ultimate learning accelerator. By
              building in public, I stay state-of-the-art, give back to the
              community, and build trust through transparent, well-documented
              code.
            </p>
          </div>
        </UCard>
      </UPageSection>
    </BlurFade>

    <!-- CTA -->
    <BlurFade :delay="500">
      <div class="text-center pb-12">
        <div class="flex flex-wrap justify-center gap-4">
          <ShimmerButton>
            <NuxtLink to="/stats" class="flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-2" class="w-4 h-4" />
              View Stats
            </NuxtLink>
          </ShimmerButton>
          <ShimmerButton>
            <NuxtLink to="/articles" class="flex items-center gap-2">
              <UIcon name="i-lucide-pen-tool" class="w-4 h-4" />
              Read Articles
            </NuxtLink>
          </ShimmerButton>
        </div>
      </div>
    </BlurFade>
  </UPage>
</template>
