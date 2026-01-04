<script setup lang="ts">
const { data: page } = await useAsyncData("index", () => {
  return queryCollection("index").first();
});
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

useSeoMeta({
  title: "Ofri Peretz - Engineering Leader & Open Source Creator",
  ogTitle: "Ofri Peretz - Engineering Leader & Open Source Creator",
  description:
    "Building Products That Matter • Engineering Leadership • Open-Source Contributor. Creator of the Interlace ESLint Ecosystem with 9,000+ npm downloads.",
  ogDescription:
    "Engineering Leader & Open Source Creator. Building security-focused ESLint plugins with 9K+ downloads.",
  ogImage: "https://ofriperetz.dev/og-home.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: "website",
  ogUrl: "https://ofriperetz.dev",
  twitterCard: "summary_large_image",
  twitterImage: "https://ofriperetz.dev/og-home.png",
  twitterTitle: "Ofri Peretz - Engineering Leader & Open Source Creator",
  twitterDescription:
    "Building security-focused ESLint plugins with 9K+ downloads.",
});
</script>

<template>
  <UPage v-if="page">
    <LandingHero :page />
    <UPageSection
      :ui="{
        container: '!pt-0 lg:grid lg:grid-cols-2 lg:gap-8',
      }"
    >
      <LandingAbout :page />
      <LandingWorkExperience :page />
    </UPageSection>

    <LandingSkills :page />
    <LandingDevToArticles :page />
    <LandingFAQ :page />
  </UPage>
</template>
