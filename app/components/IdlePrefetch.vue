<script setup lang="ts">
/**
 * IdlePrefetch Component
 *
 * Implements the idle-until-urgent pattern for Vue components.
 * Starts loading the component during browser idle time, but if user scrolls
 * into view before idle callback, loads immediately.
 *
 * Usage:
 * <IdlePrefetch>
 *   <template #default>
 *     <HeavyComponent />
 *   </template>
 *   <template #loading>
 *     <SkeletonLoader />
 *   </template>
 * </IdlePrefetch>
 */

interface Props {
  // Time before forcing load even if not idle (ms)
  timeout?: number
  // Root margin for intersection observer (load early when approaching viewport)
  rootMargin?: string
  // Minimum height for placeholder to prevent layout shift
  minHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  timeout: 2000,
  rootMargin: '200px',
  minHeight: '100px'
})

const containerRef = ref<HTMLElement | null>(null)
const shouldRender = ref(false)
const isIntersecting = ref(false)
let idleHandle: number | null = null

// Polyfill for requestIdleCallback
const requestIdleCallbackFn
  = import.meta.client && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: () => void, opts?: { timeout?: number }) => {
        return window.setTimeout(cb, opts?.timeout || 1) as unknown as number
      }

const cancelIdleCallbackFn
  = import.meta.client && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => window.clearTimeout(id)

// Start rendering
const startRender = () => {
  if (idleHandle !== null) {
    cancelIdleCallbackFn(idleHandle)
    idleHandle = null
  }
  shouldRender.value = true
}

// Set up intersection observer (urgent trigger)
const { stop: stopObserver } = useIntersectionObserver(
  containerRef,
  ([entry]) => {
    isIntersecting.value = entry?.isIntersecting ?? false
    if (isIntersecting.value && !shouldRender.value) {
      // User scrolled into view - load immediately (urgent)
      startRender()
    }
  },
  {
    rootMargin: props.rootMargin,
    threshold: 0
  }
)

// Schedule idle callback (background load)
onMounted(() => {
  if (import.meta.client && !shouldRender.value) {
    idleHandle = requestIdleCallbackFn(
      () => {
        startRender()
      },
      { timeout: props.timeout }
    )
  }
})

// Cleanup
onUnmounted(() => {
  stopObserver()
  if (idleHandle !== null) {
    cancelIdleCallbackFn(idleHandle)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :style="!shouldRender ? { minHeight: props.minHeight } : undefined"
  >
    <!-- Render actual content when ready -->
    <slot v-if="shouldRender" />

    <!-- Show loading placeholder while waiting -->
    <slot
      v-else
      name="loading"
    >
      <div
        class="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg"
        :style="{ minHeight: props.minHeight }"
      />
    </slot>
  </div>
</template>
