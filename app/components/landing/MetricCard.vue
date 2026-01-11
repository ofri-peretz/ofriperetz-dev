<script setup lang="ts">
/**
 * MetricCard - Shared component for impact metrics
 * Features a premium design with status-aware colors, sub-metrics expansion,
 * and a mobile-optimized single-column layout.
 */

interface SubMetric {
  label: string
  value: number | string
  icon?: string
}

interface Props {
  id: string
  label: string
  value: number | string
  description?: string
  icon: string
  iconColor?: string
  color: string
  bgColor: string
  borderColor: string
  subMetrics?: SubMetric[]
  loading?: boolean
  isExpanded?: boolean
  isClickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  iconColor: 'text-primary-500',
  subMetrics: () => [],
  loading: false,
  isExpanded: false,
  isClickable: true
})

const emit = defineEmits(['toggle'])

// Format large numbers using global standard
const formatNumber = (num: number | string) => {
  return formatMetric(num)
}

const toggle = () => {
  if (props.isClickable) {
    emit('toggle', props.id)
  }
}
</script>

<template>
  <div
    class="relative h-full rounded-2xl border bg-linear-to-br p-5 transition-all duration-300 group flex flex-col"
    :class="[
      bgColor,
      borderColor,
      isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01]' : ''
    ]"
    role="button"
    :aria-expanded="isExpanded"
    @click="toggle"
  >
    <!-- Main Content -->
    <div class="flex items-center justify-between h-16 sm:h-20 shrink-0">
      <div class="flex items-center gap-4 h-full">
        <div
          class="p-2 sm:p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-sm transition-transform group-hover:scale-110 shrink-0 flex items-center justify-center"
        >
          <UIcon
            :name="icon"
            class="w-5 h-5 sm:w-6 sm:h-6"
            :class="iconColor"
          />
        </div>
        <div class="flex flex-col justify-center min-w-0 flex-1">
          <div class="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200 leading-tight">
            {{ label }}
          </div>
          <div
            v-if="description"
            class="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-snug"
          >
            {{ description }}
          </div>
        </div>
      </div>

      <div
        v-if="subMetrics.length > 0"
        class="flex items-center gap-1 text-gray-400 shrink-0 ml-2"
      >
        <UIcon
          name="i-lucide-chevron-down"
          class="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300"
          :class="isExpanded ? 'rotate-180' : ''"
        />
      </div>
    </div>

    <!-- Value Section -->
    <div class="mt-auto pt-4 sm:pt-6 overflow-hidden">
      <div
        class="font-bold tabular-nums transition-all duration-500"
        :class="[
          color,
          loading ? 'animate-pulse opacity-50' : 'opacity-100',
          String(value).length > 6 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
        ]"
      >
        <template v-if="loading">
          <div class="h-8 bg-current/10 rounded-lg animate-pulse w-24" />
        </template>
        <template v-else>
          <NumberTicker
            :value="typeof value === 'number' ? value : 0"
            :duration="2000"
          />
          <span v-if="typeof value === 'string'">{{ value }}</span>
        </template>
      </div>
    </div>

    <!-- Expansion Area -->
    <AnimatePresence>
      <Motion
        v-if="isExpanded && subMetrics.length > 0"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="{ duration: 0.3, ease: 'easeOut' }"
        class="overflow-hidden"
      >
        <div class="border-t border-gray-200/50 dark:border-gray-700/50 pt-4 mt-4">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="sub in subMetrics"
              :key="sub.label"
              class="flex flex-col gap-0.5"
            >
              <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                <UIcon
                  v-if="sub.icon"
                  :name="sub.icon"
                  class="w-3 h-3"
                />
                {{ sub.label }}
              </div>
              <div class="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {{ formatNumber(sub.value) }}
              </div>
            </div>
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <!-- Interaction Glow -->
    <div
      class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity"
      :class="color"
    />
  </div>
</template>
