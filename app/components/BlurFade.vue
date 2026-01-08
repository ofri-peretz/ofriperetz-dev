<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    delay?: number
    duration?: number
    yOffset?: number
    inView?: boolean
  }>(),
  {
    delay: 0,
    duration: 500,
    yOffset: 8,
    inView: true
  }
)

const isVisible = ref(false)
const targetRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!props.inView) {
    // If not using inView detection, just trigger after delay
    setTimeout(() => {
      isVisible.value = true
    }, props.delay)
    return
  }

  if (!targetRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            isVisible.value = true
          }, props.delay)
          observer.disconnect()
        }
      })
    },
    { threshold: 0.1 }
  )

  observer.observe(targetRef.value)

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div
    ref="targetRef"
    class="transition-all ease-out"
    :style="{
      transitionDuration: `${duration}ms`,
      opacity: isVisible ? 1 : 0,
      filter: isVisible ? 'blur(0)' : 'blur(8px)',
      transform: isVisible ? 'translateY(0)' : `translateY(${yOffset}px)`
    }"
  >
    <slot />
  </div>
</template>
