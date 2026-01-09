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

// TOC items for home page sections
const tocItems = [
  { id: 'hero', label: 'Hello' },
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

    <!-- About Section with tighter, modern spacing -->
    <UPageSection
      id="about"
      data-toc-section
      :ui="{
        container: 'py-4 sm:py-6 lg:grid lg:grid-cols-2 lg:gap-6 scroll-mt-20'
      }"
    >
      <LandingAbout :page />
      <LandingWorkExperience :page />
    </UPageSection>

    <!-- Below-the-fold sections - lazy loaded for performance -->
    <div
      id="skills"
      data-toc-section
      class="scroll-mt-20 py-4 sm:py-5"
    >
      <LazyLandingSkills :page />
    </div>

    <div
      id="philosophy"
      data-toc-section
      class="scroll-mt-20 py-4 sm:py-5"
    >
      <LazyLandingPhilosophy />
    </div>

    <div
      id="articles"
      data-toc-section
      class="scroll-mt-20 py-4 sm:py-5"
    >
      <LazyLandingDevToArticles :page />
    </div>

    <div
      id="faq"
      data-toc-section
      class="scroll-mt-20 py-4 sm:py-5"
    >
      <LazyLandingFAQ :page />
    </div>
  </UPage>
</template>
