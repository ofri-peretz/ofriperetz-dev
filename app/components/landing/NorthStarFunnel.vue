<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  views: number
  downloads: number
  followers: number
  githubFollowers?: number
  devtoFollowers?: number
  reactions: number
  comments: number
  stars: number
  starsBreakdown?: { name: string, stars: number, url: string }[]
  contributions?: number
  commits?: number
  articles?: number
  readingMinutes?: number
  loading?: boolean
}

const props = defineProps<Props>()

// Track which tiers are expanded
const expandedTiers = ref<Set<string>>(new Set())

const toggleTier = (tierId: string) => {
  if (expandedTiers.value.has(tierId)) {
    expandedTiers.value.delete(tierId)
  } else {
    expandedTiers.value.add(tierId)
  }
}

// Time estimation constants
const AVG_MINUTES_PER_COMMIT = 20 // Average time per commit in minutes
const AVG_MINUTES_PER_PR = 45 // Average time per PR/review

// Calculate PRs & Reviews (contributions minus commits)
const prsAndReviews = computed(() =>
  Math.max(0, (props.contributions ?? 0) - (props.commits ?? 0))
)

// Estimate total hours invested
const estimatedHours = computed(() => {
  const commitMinutes = (props.commits ?? 0) * AVG_MINUTES_PER_COMMIT
  const prMinutes = prsAndReviews.value * AVG_MINUTES_PER_PR
  return Math.round((commitMinutes + prMinutes) / 60)
})

// Aggregations - Use contributions directly (includes commits + PRs)
const totalEffort = computed(() => props.contributions ?? 0)
const totalExposure = computed(() => props.views + props.downloads)
const totalFollowers = computed(
  () => (props.githubFollowers ?? 0) + (props.devtoFollowers ?? 0)
)
const totalEngagement = computed(() => props.reactions + props.comments)
const northStar = computed(() => props.stars)

// Conversion Rates (Safe calculation)
const exposureToEngagementRate = computed(() => {
  if (totalExposure.value === 0) return 0
  return ((totalEngagement.value / totalExposure.value) * 100).toFixed(2)
})

const engagementToNorthStarRate = computed(() => {
  if (totalEngagement.value === 0) return 0
  return ((northStar.value / totalEngagement.value) * 100).toFixed(1)
})

// Funnel Steps Configuration - Now with 5 tiers, source attribution, and impact explanations
const steps = computed(() => [
  {
    id: 'effort',
    label: 'Effort',
    subtitle: 'Leading Indicators',
    value: totalEffort.value,
    subtext: `~${estimatedHours.value} hours invested`,
    color: 'from-orange-500 to-amber-400',
    bgColor: 'from-orange-500/10 to-amber-500/10',
    borderColor: 'border-orange-500/30',
    icon: 'i-lucide-hammer',
    conversion: null,
    impactExplanation:
      'Active development signals project health → attracts contributors → more eyes on code → increases star probability',
    breakdown: [
      {
        label: 'Commits',
        value: props.commits ?? 0,
        icon: 'i-lucide-git-commit',
        source: 'GitHub',
        sourceIcon: 'i-simple-icons-github',
        impact:
          'Regular commits demonstrate consistent improvement → developers trust actively maintained projects'
      },
      {
        label: 'PRs & Reviews',
        value: prsAndReviews.value,
        icon: 'i-lucide-git-pull-request',
        source: 'GitHub',
        sourceIcon: 'i-simple-icons-github',
        impact:
          'PRs and reviews show the project is actively maintained → builds trust → users more likely to star'
      },
      {
        label: 'Est. Hours',
        value: estimatedHours.value,
        icon: 'i-lucide-clock',
        source: '~20min/commit + ~45min/PR',
        sourceIcon: 'i-lucide-info',
        impact: 'Time invested correlates with project maturity and quality'
      }
    ]
  },
  {
    id: 'exposure',
    label: 'Total Exposure',
    subtitle: 'Reach',
    value: totalExposure.value,
    subtext: 'Reach creates opportunities for discovery',
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    icon: 'i-lucide-eye',
    conversion: null,
    impactExplanation:
      'Visibility creates discovery → readers find the repo → impressed developers star it',
    breakdown: [
      {
        label: 'Views',
        value: props.views,
        icon: 'i-lucide-eye',
        source: 'Dev.to',
        sourceIcon: 'i-simple-icons-devdotto',
        impact:
          'Article views drive awareness → readers discover linked repos → increased star probability'
      },
      {
        label: 'Downloads',
        value: props.downloads,
        icon: 'i-lucide-download',
        source: 'NPM',
        sourceIcon: 'i-simple-icons-npm',
        impact:
          'Package downloads validate real utility → users who find value often return to star the repo'
      }
    ]
  },
  {
    id: 'followers',
    label: 'Followers',
    subtitle: 'Network',
    value: totalFollowers.value,
    subtext: 'Network effect amplifies reach',
    color: 'from-purple-500 to-violet-400',
    bgColor: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/30',
    icon: 'i-lucide-users',
    conversion: null,
    impactExplanation:
      'Followers see new activity in their feed → amplifies reach → network effect drives stars',
    breakdown: [
      {
        label: 'GH Followers',
        value: props.githubFollowers ?? 0,
        icon: 'i-lucide-users',
        source: 'GitHub',
        sourceIcon: 'i-simple-icons-github',
        impact:
          'GitHub followers see new repos in their feed → first to discover and star new projects'
      },
      {
        label: 'Dev.to Followers',
        value: props.devtoFollowers ?? 0,
        icon: 'i-lucide-users',
        source: 'Dev.to',
        sourceIcon: 'i-simple-icons-devdotto',
        impact:
          'Dev.to followers read new articles → discover repo links → cross-platform conversion to stars'
      }
    ]
  },
  {
    id: 'engagement',
    label: 'Community Engagement',
    subtitle: 'Resonance',
    value: totalEngagement.value,
    subtext: 'Active participation signals resonance',
    color: 'from-purple-500 to-pink-400',
    bgColor: 'from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/30',
    icon: 'i-lucide-message-circle',
    conversion: `${exposureToEngagementRate.value}%`,
    impactExplanation:
      'Community validation → builds reputation → establishes credibility → trusted projects get starred',
    breakdown: [
      {
        label: 'Reactions',
        value: props.reactions,
        icon: 'i-lucide-heart',
        source: 'Dev.to',
        sourceIcon: 'i-simple-icons-devdotto',
        impact:
          'Likes signal quality content → algorithms boost visibility → more readers discover the repo'
      },
      {
        label: 'Comments',
        value: props.comments,
        icon: 'i-lucide-message-square',
        source: 'Dev.to',
        sourceIcon: 'i-simple-icons-devdotto',
        impact:
          'Discussion builds community → shows author is responsive → establishes trust and authority'
      }
    ]
  },
  {
    id: 'content',
    label: 'Content',
    subtitle: 'Knowledge Sharing',
    value: (props.articles ?? 0) + (props.readingMinutes ?? 0),
    subtext: 'Original content builds thought leadership',
    color: 'from-green-500 to-emerald-400',
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30',
    icon: 'i-lucide-book-open',
    conversion: null,
    impactExplanation:
      'Educational content establishes expertise → readers trust recommendations → more likely to star linked projects',
    cta: { label: 'View All Articles', to: '/articles' },
    breakdown: [
      {
        label: 'Articles',
        value: props.articles ?? 0,
        icon: 'i-lucide-file-text',
        source: 'Dev.to + Medium',
        sourceIcon: 'i-simple-icons-devdotto',
        impact:
          'Published articles demonstrate expertise → readers explore linked repositories'
      },
      {
        label: 'Reading Minutes',
        value: props.readingMinutes ?? 0,
        icon: 'i-lucide-clock',
        source: 'Total Read Time',
        sourceIcon: 'i-lucide-clock',
        impact:
          'Time readers invest in your content correlates with depth of engagement → deeper trust → more likely to explore and star your projects'
      }
    ]
  },
  {
    id: 'northstar',
    label: 'North Star',
    subtitle: 'Authority',
    value: northStar.value,
    subtext: 'Peer-recognized technical value',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'from-yellow-400/10 to-orange-500/10',
    borderColor: 'border-yellow-500/30',
    icon: 'i-lucide-star',
    conversion: `${engagementToNorthStarRate.value}%`,
    breakdown: [
      ...(props.starsBreakdown && props.starsBreakdown.length > 0
        ? props.starsBreakdown.map(repo => ({
            label: repo.name,
            value: repo.stars,
            icon: 'i-lucide-star',
            source: 'GitHub',
            sourceIcon: 'i-simple-icons-github',
            url: repo.url,
            impact:
              'Each star represents a developer who found this project valuable enough to bookmark → social proof attracts more stars'
          }))
        : [
            {
              label: 'GitHub Stars',
              value: props.stars,
              icon: 'i-lucide-star',
              source: 'GitHub',
              sourceIcon: 'i-simple-icons-github',
              impact:
                'Stars are the ultimate measure of peer-recognized technical value → demonstrates your projects resonate with the developer community'
            }
          ])
    ]
  }
])

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toLocaleString()
}
</script>

<template>
  <UCard class="w-full overflow-hidden">
    <template #header>
      <div class="flex items-start sm:items-center justify-between flex-wrap gap-2">
        <div class="flex items-start sm:items-center gap-2">
          <UIcon
            name="i-lucide-compass"
            class="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 animate-pulse shrink-0 mt-0.5 sm:mt-0"
          />
          <div>
            <h3 class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
              North Star Impact Funnel
            </h3>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Following
              <a
                href="https://articles.sequoiacap.com/frameworks-for-product-success"
                target="_blank"
                class="text-primary-500 hover:underline"
              >Sequoia's Framework</a>
              for measuring product success
            </p>
          </div>
        </div>
        <UBadge
          color="primary"
          variant="soft"
          size="xs"
          class="shrink-0"
        >
          <UIcon
            name="i-lucide-info"
            class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"
          />
          <span class="text-[10px] sm:text-xs">Click to expand</span>
        </UBadge>
      </div>
    </template>

    <div class="space-y-3 sm:space-y-4 relative">
      <!-- Connection Line -->
      <div
        class="absolute left-6 top-8 bottom-8 w-0.5 bg-linear-to-b from-orange-300 via-purple-300 to-yellow-300 dark:from-orange-700 dark:via-purple-700 dark:to-yellow-700 -z-10 hidden sm:block"
      />

      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="relative"
      >
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-start group">
          <!-- Icon Circle -->
          <div class="flex-shrink-0 relative z-10 hidden sm:flex">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 border-2 border-white dark:border-gray-900 shadow-sm transition-all duration-300 group-hover:scale-110"
              :class="[
                step.id === 'northstar'
                  ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-900'
                  : ''
              ]"
            >
              <UIcon
                :name="step.icon"
                class="w-6 h-6 transition-colors"
                :class="[
                  step.id === 'northstar'
                    ? 'text-yellow-500'
                    : 'text-gray-400 group-hover:text-primary-500'
                ]"
              />
            </div>
          </div>

          <!-- Content Card -->
          <div class="flex-1 min-w-0">
            <div
              class="p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-linear-to-br cursor-pointer transition-all duration-300 hover:shadow-md relative overflow-hidden"
              :class="[step.bgColor, step.borderColor]"
              @click="toggleTier(step.id)"
            >
              <!-- Header Row -->
              <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 sm:gap-2 mb-2 sm:mb-3"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span
                      class="font-bold text-gray-900 dark:text-white text-base sm:text-lg"
                    >
                      {{ step.label }}
                    </span>
                    <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <UBadge
                        v-if="step.id === 'northstar'"
                        color="warning"
                        variant="soft"
                        size="xs"
                      >
                        🎯 Goal
                      </UBadge>
                      <UBadge
                        v-else
                        color="neutral"
                        variant="soft"
                        size="xs"
                      >
                        {{ step.subtitle }}
                      </UBadge>
                      <!-- Impact Info Icon -->
                      <UTooltip
                        v-if="step.impactExplanation"
                        :text="step.impactExplanation"
                        :popper="{ placement: 'top' }"
                      >
                        <UIcon
                          name="i-lucide-info"
                          class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-primary-500 cursor-help transition-colors"
                        />
                      </UTooltip>
                    </div>
                  </div>
                  <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                    {{ step.subtext }}
                  </p>
                  <!-- Visible Impact Explanation -->
                  <p
                    v-if="step.impactExplanation && step.id !== 'northstar'"
                    class="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 sm:mt-2 flex items-start gap-1 sm:gap-1.5 leading-relaxed line-clamp-2 sm:line-clamp-none"
                  >
                    <UIcon
                      name="i-lucide-zap"
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0 mt-0.5"
                    />
                    <span class="italic">{{ step.impactExplanation }}</span>
                  </p>
                </div>

                <!-- Value Display - always aligned right -->
                <div
                  class="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0 shrink-0"
                >
                  <div
                    class="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums bg-clip-text text-transparent bg-linear-to-r"
                    :class="step.color"
                  >
                    <NumberTicker
                      :value="step.value"
                      :duration="2000"
                    />
                  </div>
                  <UIcon
                    :name="
                      expandedTiers.has(step.id)
                        ? 'i-lucide-chevron-up'
                        : 'i-lucide-chevron-down'
                    "
                    class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 sm:mt-1"
                  />
                </div>
              </div>

              <!-- Expanded Breakdown -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-200 ease-in"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-40"
                leave-from-class="opacity-100 max-h-40"
                leave-to-class="opacity-0 max-h-0"
              >
                <div
                  v-if="expandedTiers.has(step.id)"
                  class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 overflow-hidden"
                >
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div
                      v-for="item in step.breakdown"
                      :key="item.label"
                      class="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50"
                    >
                      <UIcon
                        :name="item.icon"
                        class="w-4 h-4 text-gray-400"
                      />
                      <div class="flex-1">
                        <div
                          class="text-sm font-semibold text-gray-900 dark:text-white tabular-nums flex items-center gap-1"
                        >
                          {{ formatNumber(item.value) }}
                          <!-- Breakdown item impact info icon -->
                          <UTooltip
                            v-if="'impact' in item"
                            :text="(item as any).impact"
                            :popper="{ placement: 'top' }"
                          >
                            <UIcon
                              name="i-lucide-info"
                              class="w-3 h-3 text-gray-400 hover:text-primary-500 cursor-help transition-colors"
                            />
                          </UTooltip>
                        </div>
                        <div class="text-[10px] text-gray-500">
                          {{ item.label }}
                        </div>
                      </div>
                      <div
                        v-if="item.source"
                        class="flex items-center gap-0.5 text-[9px] text-gray-400"
                      >
                        <UIcon
                          :name="item.sourceIcon"
                          class="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                  <!-- CTA Button -->
                  <div
                    v-if="step.cta"
                    class="mt-3 text-center"
                  >
                    <NuxtLink
                      :to="step.cta.to"
                      class="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {{ step.cta.label }}
                      <UIcon
                        name="i-lucide-arrow-right"
                        class="w-4 h-4"
                      />
                    </NuxtLink>
                  </div>
                </div>
              </Transition>

              <!-- Progress Bar -->
              <div
                class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-3"
              >
                <div
                  class="h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out"
                  :class="step.color"
                  :style="{
                    width:
                      index === 0
                        ? '100%'
                        : `${Math.max(5, (step.value / (steps[0]?.value || 1)) * 100)}%`
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Conversion Connector (Desktop) -->
          <div
            v-if="step.conversion && index > 0"
            class="absolute -top-3 left-[3.25rem] z-10 hidden sm:block ps-8"
          >
            <div
              class="bg-white dark:bg-gray-900 text-[10px] text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-arrow-down"
                class="w-3 h-3"
              />
              {{ step.conversion }} conversion
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2"
      >
        <UIcon
          name="i-lucide-lightbulb"
          class="w-4 h-4"
        />
        <span>Metrics show how effort and exposure convert into lasting
          authority</span>
      </div>
    </template>
  </UCard>
</template>
