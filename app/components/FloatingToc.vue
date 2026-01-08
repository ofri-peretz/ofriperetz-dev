<script setup lang="ts">
// Notion-style floating TOC that appears on hover

interface TocItem {
  id: string
  label: string
  level?: number
}

interface Props {
  items: TocItem[]
}

defineProps<Props>()

const isExpanded = ref(false)
const activeSection = ref<string | null>(null)

// Scroll to section
const scrollTo = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = id
  }
}

// Track active section on scroll
const updateActiveSection = () => {
  const sections = document.querySelectorAll('[data-toc-section]')
  let current: string | null = null

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    if (rect.top <= 150) {
      current = section.id
    }
  })

  activeSection.value = current
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
</script>

<template>
  <div
    class="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden min-[1020px]:block"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- Collapsed state: minimal indicator bar -->
    <div
      class="relative transition-all duration-300 ease-out"
      :class="isExpanded ? 'opacity-0 scale-95' : 'opacity-100 scale-100'"
    >
      <div
        class="flex flex-col gap-1.5 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div
          v-for="(item, index) in items.slice(0, 8)"
          :key="index"
          class="w-1 h-3 rounded-full transition-colors duration-200"
          :class="
            activeSection === item.id
              ? 'bg-primary-500'
              : 'bg-gray-300 dark:bg-gray-600'
          "
        />
      </div>
    </div>

    <!-- Expanded state: full TOC -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-4 scale-95"
      enter-to-class="opacity-100 translate-x-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0 scale-100"
      leave-to-class="opacity-0 translate-x-4 scale-95"
    >
      <div
        v-show="isExpanded"
        class="absolute right-0 top-1/2 -translate-y-1/2 min-w-[180px] max-w-[220px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl p-3"
      >
        <!-- Header -->
        <div
          class="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800"
        >
          <UIcon
            name="i-lucide-list"
            class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
          />
          <span
            class="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
          >On this page</span>
        </div>

        <!-- TOC Items -->
        <nav class="flex flex-col gap-0.5">
          <button
            v-for="item in items"
            :key="item.id"
            class="group flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
            :class="[
              activeSection === item.id
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400',
              item.level === 2 && 'pl-4'
            ]"
            @click="scrollTo(item.id)"
          >
            <!-- Active indicator -->
            <div
              class="w-1 h-4 rounded-full transition-all duration-200"
              :class="
                activeSection === item.id
                  ? 'bg-primary-500'
                  : 'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
              "
            />
            <span
              class="text-xs font-medium truncate"
              :class="
                activeSection === item.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
              "
            >
              {{ item.label }}
            </span>
          </button>
        </nav>

        <!-- Keyboard hint -->
        <div
          class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-center"
        >
          <span class="text-[9px] text-gray-400 dark:text-gray-500">Click to navigate</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
