<script setup lang="ts"></script>

<template>
  <BlurFade :delay="400">
    <UContainer>
      <div class="py-4">
        <UCard
          class="bg-linear-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800"
        >
          <div class="text-center">
            <UIcon
              name="i-lucide-heart"
              class="w-10 h-10 text-primary-500 mx-auto mb-4"
            />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              <SparklesText :sparkles-count="6">
                Open Source Philosophy
              </SparklesText>
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm max-w-lg mx-auto">
              I believe open source is the ultimate learning accelerator. By
              building in public, I stay state-of-the-art, give back to the
              community, and build trust through transparent, well-documented
              code.
            </p>
          </div>
        </UCard>
      </div>
    </UContainer>
  </BlurFade>
</template>
