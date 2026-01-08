<script setup lang="ts">
// Elegant CTA that opens LinkedIn profile
// No LinkedIn branding - just a clean "Let's Talk" button

const { track } = useVisitorTracking()

const linkedinUrl = 'https://www.linkedin.com/in/ofri-peretz/'

const handleClick = () => {
  track('contact_intent_click')
  setTimeout(() => {
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer')
  }, 100)
}
</script>

<template>
  <!-- Clean, elegant CTA - no LinkedIn branding -->
  <button
    class="cursor-pointer group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-300 hover:scale-[1.02]"
    @click="handleClick"
  >
    <span class="text-gray-500 dark:text-gray-400">Want to reach out?</span>
    <span class="font-semibold text-gray-900 dark:text-white">Let's Talk</span>
    <UIcon
      name="i-lucide-arrow-right"
      class="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"
    />
  </button>
</template>
