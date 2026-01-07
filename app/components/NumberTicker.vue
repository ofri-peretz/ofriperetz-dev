<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number;
    startValue?: number;
    duration?: number;
    decimalPlaces?: number;
    suffix?: string;
    prefix?: string;
  }>(),
  {
    startValue: 0,
    duration: 2000,
    decimalPlaces: 0,
    suffix: "",
    prefix: "",
  },
);

const displayValue = ref(props.startValue);
const isVisible = ref(false);
const targetRef = ref<HTMLElement | null>(null);

// Easing function for smooth animation
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

// Format the number
const formattedValue = computed(() => {
  const num = displayValue.value.toFixed(props.decimalPlaces);
  // Add thousand separators
  const parts = num.split(".");
  parts[0] = (parts[0] ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return props.prefix + parts.join(".") + props.suffix;
});

// Animate when visible
const animate = () => {
  if (!isVisible.value) return;

  const start = props.startValue;
  const end = props.value;
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / props.duration, 1);
    const easedProgress = easeOutExpo(progress);

    displayValue.value = start + (end - start) * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      displayValue.value = end;
    }
  };

  requestAnimationFrame(step);
};

// Watch for value changes
watch(
  () => props.value,
  () => {
    if (isVisible.value) {
      animate();
    }
  },
);

// Intersection observer for visibility
onMounted(() => {
  if (!targetRef.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isVisible.value) {
          isVisible.value = true;
          animate();
        }
      });
    },
    { threshold: 0.1 },
  );

  observer.observe(targetRef.value);

  onUnmounted(() => observer.disconnect());
});
</script>

<template>
  <span ref="targetRef" class="tabular-nums">
    {{ formattedValue }}
  </span>
</template>
