<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => {
  return queryCollection('index').first()
})
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useSeoMeta({
  title: 'Ofri Peretz - Engineering Leader & Open Source Creator',
  ogTitle: 'Ofri Peretz - Engineering Leader & Open Source Creator',
  description:
    'Building Products That Matter • Engineering Leadership • Open-Source Contributor. Creator of the Interlace ESLint Ecosystem with 9,000+ npm downloads.',
  ogDescription:
    'Engineering Leader & Open Source Creator. Building security-focused ESLint plugins with 9K+ downloads.',
  ogImage: 'https://ofriperetz.dev/og-home.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: 'website',
  ogUrl: 'https://ofriperetz.dev',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://ofriperetz.dev/og-home.png',
  twitterTitle: 'Ofri Peretz - Engineering Leader & Open Source Creator',
  twitterDescription:
    'Building security-focused ESLint plugins with 9K+ downloads.'
})

const { stats: homeStats, loading: homeLoading, fetchStats } = useHomepageStats()

onMounted(() => {
  fetchStats()
})

// TOC items for home page sections
const tocItems = [
  { id: 'hero', label: 'Hello' },
  { id: 'impact', label: 'Impact' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'articles', label: 'Articles' },
  { id: 'faq', label: 'FAQ' }
]
</script>

<template>
  <UPage v-if="page">
    <!-- Floating TOC -->
    <FloatingToc :items="tocItems" />

    <div
      id="hero"
      data-toc-section
      class="scroll-mt-20"
    >
      <LandingHero :page />
    </div>

    <!-- Impact Section - Interactive metrics -->
    <UPageSection
      id="impact"
      data-toc-section
      class="scroll-mt-20"
      :ui="{
        wrapper: 'py-12 sm:py-20',
        container: 'max-w-6xl mx-auto py-0'
      }"
    >
      <LandingImpactMetricsBlock
        :downloads="homeStats?.npm?.totalDownloads || 0"
        :views="homeStats?.devto?.totalViews || 0"
        :followers="(homeStats?.github?.followers || 0) + (homeStats?.devto?.followers || 0)"
        :github-followers="homeStats?.github?.followers || 0"
        :devto-followers="homeStats?.devto?.followers || 0"
        :contributions="homeStats?.github?.totalContributions || 0"
        :commits="homeStats?.github?.recentCommits || 0"
        :articles="homeStats?.devto?.articleCount || 0"
        :reactions="homeStats?.devto?.totalReactions || 0"
        :comments="homeStats?.devto?.totalComments || 0"
        :reading-minutes="homeStats?.devto?.totalReadingMinutes || 0"
        :packages="homeStats?.npm?.packageCount || 0"
        :loading="homeLoading"
        show-cta
      />
    </UPageSection>

    <!-- About Section with tighter, modern spacing -->
    <UPageSection
      id="about"
      data-toc-section
      class="scroll-mt-20"
      :ui="{
        wrapper: 'py-12 sm:py-20',
        container: 'lg:grid lg:grid-cols-2 lg:gap-12 py-0'
      }"
    >
      <LandingAbout :page />
      <LandingWorkExperience :page />
    </UPageSection>

    <!-- Below-the-fold sections - lazy loaded for performance -->
    <div
      id="skills"
      data-toc-section
      class="scroll-mt-20 py-12 sm:py-20"
    >
      <LazyLandingSkills :page />
    </div>

    <div
      id="philosophy"
      data-toc-section
      class="scroll-mt-20 py-12 sm:py-20"
    >
      <LazyLandingPhilosophy />
    </div>

    <div
      id="articles"
      data-toc-section
      class="scroll-mt-20 py-12 sm:py-20"
    >
      <LazyLandingDevToArticles :page />
    </div>

    <div
      id="faq"
      data-toc-section
      class="scroll-mt-20 py-12 sm:py-20"
    >
      <LazyLandingFAQ :page />
    </div>
  </UPage>
</template>
