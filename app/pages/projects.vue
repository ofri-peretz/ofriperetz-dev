<script setup lang="ts">
const { data: page } = await useAsyncData("projects-page", () => {
  return queryCollection("pages").path("/projects").first();
});
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const { data: projects } = await useAsyncData("projects", () => {
  return queryCollection("projects").all();
});

const { global } = useAppConfig();

useSeoMeta({
  title: "Open Source Projects - Ofri Peretz | Interlace ESLint Ecosystem",
  description:
    "Explore 35+ open source repositories including the Interlace ESLint Ecosystem with 16+ packages and 9,000+ npm downloads.",
  ogTitle: "Open Source Projects - Ofri Peretz",
  ogDescription:
    "35+ repos including 16+ npm packages with 9K+ downloads. Security-focused ESLint ecosystem.",
  ogImage: "https://ofriperetz.dev/og-projects.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: "website",
  ogUrl: "https://ofriperetz.dev/projects",
  twitterCard: "summary_large_image",
  twitterImage: "https://ofriperetz.dev/og-projects.png",
  twitterTitle: "Open Source Projects - Ofri Peretz",
  twitterDescription:
    "35+ repos including 16+ npm packages with 9K+ downloads.",
});
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :description="page.description"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start',
      }"
    >
      <template #title>
        <BlurFade :delay="0">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold">
            <GradientText animate>{{ page.title }}</GradientText>
          </h1>
        </BlurFade>
      </template>

      <template #links>
        <BlurFade :delay="100">
          <div class="flex flex-wrap items-center gap-3 mt-6">
            <ShimmerButton>
              <NuxtLink
                to="https://github.com/ofri-peretz/eslint"
                target="_blank"
                class="flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-github" class="w-4 h-4" />
                View on GitHub
                <UIcon
                  name="i-lucide-external-link"
                  class="w-3 h-3 opacity-60"
                />
              </NuxtLink>
            </ShimmerButton>
            <ShimmerButton>
              <NuxtLink
                to="https://www.npmjs.com/~ofriperetz"
                target="_blank"
                class="flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-npm" class="w-4 h-4" />
                View on NPM
                <UIcon
                  name="i-lucide-external-link"
                  class="w-3 h-3 opacity-60"
                />
              </NuxtLink>
            </ShimmerButton>
          </div>
        </BlurFade>
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0',
      }"
    >
      <Motion
        v-for="(project, index) in projects"
        :key="project.title"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.2 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageCard
          :title="project.title"
          :description="project.description"
          :to="project.url"
          orientation="horizontal"
          variant="naked"
          :reverse="index % 2 === 1"
          class="group"
          :ui="{
            wrapper: 'max-sm:order-last',
          }"
        >
          <template #leading>
            <span class="text-sm text-muted">
              {{ new Date(project.date).getFullYear() }}
            </span>
          </template>
          <template #footer>
            <ULink
              :to="project.url"
              class="text-sm text-primary flex items-center"
            >
              View Project
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </ULink>
          </template>
          <img
            :src="project.image"
            :alt="project.title"
            class="object-cover w-full h-48 rounded-lg"
          />
        </UPageCard>
      </Motion>
    </UPageSection>
  </UPage>
</template>
