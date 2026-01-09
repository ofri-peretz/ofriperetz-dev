<script setup lang="ts">
import { STARS_VISIBILITY_THRESHOLD } from '~/utils/constants'

interface Props {
  stars: number
  previousStars?: number
  targetStars?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  previousStars: 0,
  targetStars: 100
})

// Early stage mode: hide progress bar until we have meaningful stars
const isEarlyStage = computed(() => props.stars < STARS_VISIBILITY_THRESHOLD)

// Calculate growth percentage
const growthPercent = computed(() => {
  if (props.previousStars === 0) return null
  return (
    ((props.stars - props.previousStars) / props.previousStars)
    * 100
  ).toFixed(0)
})

// Calculate progress to target
const progressPercent = computed(() => {
  return Math.min(100, (props.stars / props.targetStars) * 100)
})

// Show tooltip state
const showTooltip = ref(false)
</script>

<template>
  <div
    class="relative overflow-hidden rounded-xl sm:rounded-2xl border border-yellow-500/30 bg-linear-to-br from-yellow-500/5 via-orange-500/5 to-amber-500/5 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-amber-900/20 p-4 sm:p-6 md:p-8"
  >
    <!-- Background glow effect -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"
    />

    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <UIcon
          name="i-lucide-compass"
          class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse"
        />
        <span
          class="text-xs sm:text-sm font-medium tracking-wider text-yellow-600 dark:text-yellow-400 uppercase"
        >
          North Star Metric
        </span>
        <button
          class="relative"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
          @focus="showTooltip = true"
          @blur="showTooltip = false"
        >
          <UIcon
            name="i-lucide-info"
            class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-yellow-500 transition-colors cursor-help"
          />
          <!-- Tooltip -->
          <Transition
            enter-active-class="transition-all duration-200"
            leave-active-class="transition-all duration-150"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="showTooltip"
              class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 sm:w-64 p-2.5 sm:p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[11px] sm:text-xs rounded-lg shadow-xl z-50"
            >
              <p class="font-medium mb-1">
                What is a North Star Metric?
              </p>
              <p class="text-gray-300 dark:text-gray-600">
                Following Sequoia's framework, a North Star Metric is the single
                metric that best captures the core value you deliver. For open
                source, GitHub Stars represent peer-recognized technical value.
              </p>
              <a
                href="https://articles.sequoiacap.com/frameworks-for-product-success"
                target="_blank"
                class="text-yellow-400 dark:text-yellow-600 hover:underline mt-2 inline-flex items-center gap-1"
              >
                Learn more
                <UIcon
                  name="i-lucide-external-link"
                  class="w-3 h-3"
                />
              </a>
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-100"
              />
            </div>
          </Transition>
        </button>
      </div>

      <!-- Main Star Display -->
      <div class="text-center mb-4 sm:mb-6">
        <div class="inline-flex items-center gap-2 sm:gap-3">
          <UIcon
            name="i-lucide-star"
            class="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-yellow-400 drop-shadow-lg"
          />
          <div
            class="text-4xl sm:text-5xl md:text-7xl font-bold tabular-nums bg-clip-text text-transparent bg-linear-to-r from-yellow-400 via-orange-400 to-yellow-500"
          >
            <span
              v-if="loading"
              class="animate-pulse"
            >...</span>
            <NumberTicker
              v-else
              :value="stars"
              :duration="2500"
            />
          </div>
        </div>
        <div class="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">
          GitHub Stars
        </div>
      </div>

      <!-- Stats Row -->
      <div
        class="flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap mb-4 sm:mb-6"
      >
        <!-- Growth Badge -->
        <div
          v-if="growthPercent && growthPercent !== '0'"
          class="flex items-center gap-1 sm:gap-1.5"
        >
          <UIcon
            :name="
              parseFloat(growthPercent) >= 0
                ? 'i-lucide-trending-up'
                : 'i-lucide-trending-down'
            "
            :class="[
              'w-3.5 h-3.5 sm:w-4 sm:h-4',
              parseFloat(growthPercent) >= 0
                ? 'text-green-500'
                : 'text-red-500'
            ]"
          />
          <span
            :class="[
              'font-medium text-[11px] sm:text-sm',
              parseFloat(growthPercent) >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            ]"
          >
            {{ parseFloat(growthPercent) >= 0 ? "+" : "" }}{{ growthPercent }}%
            this month
          </span>
        </div>

        <!-- Divider -->
        <div
          class="w-px h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 hidden sm:block"
        />

        <!-- Target Progress -->
        <div class="flex items-center gap-1 sm:gap-1.5">
          <UIcon
            name="i-lucide-target"
            class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
          />
          <span class="text-[11px] sm:text-sm text-gray-600 dark:text-gray-400">
            Target: <span class="font-medium">{{ targetStars }}</span>
          </span>
        </div>
      </div>

      <!-- Progress to Target - Only show when we have meaningful progress -->
      <div
        v-if="!isEarlyStage"
        class="max-w-md mx-auto px-2 sm:px-0"
      >
        <div class="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
          <span>Progress to target</span>
          <span>{{ progressPercent.toFixed(0) }}%</span>
        </div>
        <div
          class="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-linear-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>

      <!-- Early Stage: Show momentum message instead of low progress bar -->
      <div
        v-else
        class="max-w-md mx-auto px-2 sm:px-0"
      >
        <div class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <UIcon
            name="i-lucide-rocket"
            class="w-4 h-4 text-yellow-500"
          />
          <span>Building momentum — focused on shipping value</span>
        </div>
      </div>

      <!-- Quote -->
      <div
        class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 italic max-w-lg mx-auto"
      >
        "GitHub Stars represent peer-recognized technical value — a durable
        signal of quality and utility in the engineering ecosystem."
      </div>
    </div>
  </div>
</template>
