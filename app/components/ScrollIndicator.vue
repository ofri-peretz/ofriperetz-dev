<script setup lang="ts">
/**
 * ScrollIndicator - Floating navigation to next section
 *
 * Features:
 * - Auto-detects sections using data-toc-section attribute
 * - Persists throughout page navigation
 * - Only hides when near bottom of page
 * - Shows on large screens only (desktop)
 */

const isVisible = ref(true)
const currentLabel = ref('')

const findAllSections = () => {
  return Array.from(document.querySelectorAll('[data-toc-section]')) as HTMLElement[]
}

const findNextSection = () => {
  const scrollY = window.scrollY
  const sections = findAllSections()

  // Find the next section that's below current scroll position
  for (const element of sections) {
    const rect = element.getBoundingClientRect()
    const absoluteTop = rect.top + scrollY

    // If section starts below current scroll position + offset
    if (absoluteTop > scrollY + 150) {
      return element
    }
  }
  return null
}

const scrollToNextSection = () => {
  const next = findNextSection()
  if (next) {
    next.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const updateVisibility = () => {
  const scrollY = window.scrollY
  const pageHeight = document.documentElement.scrollHeight
  const viewportHeight = window.innerHeight

  // Hide when within 200px of page bottom or page too short
  const nearBottom = scrollY + viewportHeight >= pageHeight - 200
  const pageTooShort = pageHeight <= viewportHeight + 100

  isVisible.value = !nearBottom && !pageTooShort

  // Update label based on next section
  const next = findNextSection()
  if (next) {
    const id = next.id || ''
    currentLabel.value = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')
  } else {
    currentLabel.value = ''
  }
}

onMounted(() => {
  // Small delay to let page render
  setTimeout(updateVisibility, 100)
  window.addEventListener('scroll', updateVisibility, { passive: true })
  window.addEventListener('resize', updateVisibility, { passive: true })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateVisibility)
    window.removeEventListener('resize', updateVisibility)
  })
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="opacity-0 translate-y-4"
    leave-to-class="opacity-0 translate-y-4"
  >
    <button
      v-if="isVisible"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex-col items-center gap-1.5 group cursor-pointer hidden lg:flex"
      aria-label="Scroll to next section"
      @click="scrollToNextSection"
    >
      <!-- Label showing next section name -->
      <span
        class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300"
      >
        {{ currentLabel }}
      </span>

      <!-- Animated scroll indicator -->
      <div class="relative flex flex-col items-center">
        <!-- Main indicator container -->
        <div class="relative p-2.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/80 shadow-lg shadow-gray-200/30 dark:shadow-none group-hover:shadow-xl group-hover:border-primary-300 dark:group-hover:border-primary-500/50 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-all duration-300">
          <!-- Bouncing chevron -->
          <UIcon
            name="i-lucide-chevron-down"
            class="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 animate-bounce transition-colors duration-300"
          />
        </div>
      </div>
    </button>
  </Transition>
</template>

<style scoped>
/* Custom bounce animation - slower and more subtle */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(4px);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce {
  animation: bounce 1.5s infinite;
}
</style>
