<script setup lang="ts">
import {
  NODE_CONFIGS,
  NODE_POSITIONS,
  COLOR_CLASSES,
  WIRE_CONNECTIONS,
  formatNumber,
  getCardWidth,
  type NodeConfig
} from '~/utils/northstar-config'

interface Props {
  views: number
  downloads: number
  followers: number
  reactions: number
  comments: number
  stars: number
  contributions?: number
  commits?: number
  articles?: number
  readingMinutes?: number
  githubFollowers?: number
  devtoFollowers?: number
  loading?: boolean
}

const props = defineProps<Props>()

// Canvas zoom & pan state
const scale = ref(0.5)
const canvasOffset = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const MIN_SCALE = 0.4
const MAX_SCALE = 2.5

// Node positions (custom dragged positions)
const nodePositions = ref<Record<string, { x: number, y: number }>>({})
const draggingNodeId = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const expandedNodeId = ref<string | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// Zoom controls
const zoomIn = () => {
  scale.value = Math.min(MAX_SCALE, scale.value + 0.2)
}
const zoomOut = () => {
  scale.value = Math.max(MIN_SCALE, scale.value - 0.2)
}
const resetView = () => {
  scale.value = 0.5
  canvasOffset.value = { x: 0, y: 0 }
  nodePositions.value = {}
}

// Wheel zoom
const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = -e.deltaY * 0.005
    scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value + delta))
  }
}

// Canvas pan
const startCanvasPan = (e: MouseEvent) => {
  if (e.button !== 0) return
  if ((e.target as HTMLElement).closest('.node-card')) return
  isPanning.value = true
  panStart.value = {
    x: e.clientX - canvasOffset.value.x,
    y: e.clientY - canvasOffset.value.y
  }
}

const onCanvasPan = (e: MouseEvent) => {
  if (isPanning.value) {
    canvasOffset.value = {
      x: e.clientX - panStart.value.x,
      y: e.clientY - panStart.value.y
    }
  } else if (draggingNodeId.value) {
    const rect = containerRef.value?.getBoundingClientRect()
    if (!rect) return
    const x
      = ((e.clientX - rect.left - canvasOffset.value.x)
        / scale.value
        / rect.width)
      * 100
    const y
      = ((e.clientY - rect.top - canvasOffset.value.y)
        / scale.value
        / rect.height)
      * 100
    nodePositions.value[draggingNodeId.value] = {
      x: Math.max(5, Math.min(95, x - dragOffset.value.x)),
      y: Math.max(5, Math.min(95, y - dragOffset.value.y))
    }
  }
}

const endInteraction = () => {
  isPanning.value = false
  draggingNodeId.value = null
}

const startNodeDrag = (e: MouseEvent, nodeId: string) => {
  e.stopPropagation()
  if (e.button !== 0) return
  const pos = getNodePosition(nodeId)
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const mouseX
    = ((e.clientX - rect.left - canvasOffset.value.x)
      / scale.value
      / rect.width)
    * 100
  const mouseY
    = ((e.clientY - rect.top - canvasOffset.value.y)
      / scale.value
      / rect.height)
    * 100
  dragOffset.value = { x: mouseX - pos.x, y: mouseY - pos.y }
  draggingNodeId.value = nodeId
}

const toggleNodeExpansion = (nodeId: string) => {
  if (draggingNodeId.value) return
  expandedNodeId.value = expandedNodeId.value === nodeId ? null : nodeId
}

// Get current position
const getNodePosition = (nodeId: string) =>
  nodePositions.value[nodeId] || NODE_POSITIONS[nodeId] || { x: 50, y: 50 }

// Map prop values to node IDs (memoized once per prop change)
const nodeValues = computed(() => ({
  stars: props.stars,
  effort: props.contributions ?? 0,
  exposure: props.views + props.downloads,
  followers: (props.githubFollowers ?? 0) + (props.devtoFollowers ?? 0),
  engagement: props.reactions + props.comments,
  content: (props.articles ?? 0) + (props.readingMinutes ?? 0),
  contributions: props.contributions ?? 0,
  commits: props.commits ?? 0,
  downloads: props.downloads,
  views: props.views,
  ghFollowers: props.githubFollowers ?? 0,
  devtoFollowers: props.devtoFollowers ?? 0,
  reactions: props.reactions,
  comments: props.comments,
  articles: props.articles ?? 0,
  reading: props.readingMinutes ?? 0
}))

// Build nodes with values (uses static config + dynamic values)
interface NodeWithValue extends NodeConfig {
  value: number
  defaultX: number
  defaultY: number
}

const nodes = computed<NodeWithValue[]>(() =>
  NODE_CONFIGS.map(config => ({
    ...config,
    value: nodeValues.value[config.id as keyof typeof nodeValues.value] ?? 0,
    defaultX: NODE_POSITIONS[config.id]?.x ?? 50,
    defaultY: NODE_POSITIONS[config.id]?.y ?? 50
  }))
)

// Use pre-computed static wires
const wires = WIRE_CONNECTIONS

// Get wire path dynamically based on current positions
const getWirePath = (fromId: string, toId: string) => {
  const from = getNodePosition(fromId)
  const to = getNodePosition(toId)
  const midY = (from.y + to.y) / 2
  return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`
}

// Re-export utilities for template
const colorClasses = COLOR_CLASSES
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full aspect-[16/9] min-h-[520px] rounded-2xl overflow-hidden select-none touch-none bg-slate-50 dark:bg-slate-900"
    :class="isPanning || draggingNodeId ? 'cursor-grabbing' : 'cursor-grab'"
    @wheel.prevent="handleWheel"
    @mousedown="startCanvasPan"
    @mousemove="onCanvasPan"
    @mouseup="endInteraction"
    @mouseleave="endInteraction"
  >
    <!-- Dotted background -->
    <div class="absolute inset-0 dotted-bg opacity-40" />

    <!-- Zoom Controls -->
    <div
      class="absolute top-3 right-3 z-50 flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1"
    >
      <button
        class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Zoom out"
        @click.stop="zoomOut"
      >
        <UIcon
          name="i-lucide-minus"
          class="w-4 h-4"
        />
      </button>
      <span
        class="px-2 text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[3rem] text-center tabular-nums"
      >
        {{ Math.round(scale * 100) }}%
      </span>
      <button
        class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Zoom in"
        @click.stop="zoomIn"
      >
        <UIcon
          name="i-lucide-plus"
          class="w-4 h-4"
        />
      </button>
      <div class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
      <button
        class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Reset view"
        @click.stop="resetView"
      >
        <UIcon
          name="i-lucide-rotate-ccw"
          class="w-4 h-4"
        />
      </button>
    </div>

    <!-- Hint -->
    <div
      class="absolute bottom-3 left-3 z-30 text-[10px] text-gray-500 dark:text-gray-400"
    >
      Drag nodes to reposition • Click to expand • Pinch/Ctrl+scroll to zoom
    </div>

    <!-- Legend -->
    <div
      class="absolute bottom-3 right-3 z-30 flex flex-wrap gap-2 text-[10px]"
    >
      <div class="flex items-center gap-1 text-orange-500">
        <div class="w-2 h-2 rounded-full bg-orange-500" />
        <span>Effort</span>
      </div>
      <div class="flex items-center gap-1 text-blue-500">
        <div class="w-2 h-2 rounded-full bg-blue-500" />
        <span>Exposure</span>
      </div>
      <div class="flex items-center gap-1 text-purple-500">
        <div class="w-2 h-2 rounded-full bg-purple-500" />
        <span>Network</span>
      </div>
      <div class="flex items-center gap-1 text-pink-500">
        <div class="w-2 h-2 rounded-full bg-pink-500" />
        <span>Engagement</span>
      </div>
      <div class="flex items-center gap-1 text-green-500">
        <div class="w-2 h-2 rounded-full bg-green-500" />
        <span>Content</span>
      </div>
    </div>

    <!-- Transformable Canvas -->
    <div
      class="absolute inset-0 will-change-transform"
      :style="{
        transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`
      }"
    >
      <!-- SVG Wires -->
      <svg
        class="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          v-for="wire in wires"
          :key="`${wire.from}-${wire.to}`"
          :d="getWirePath(wire.from, wire.to)"
          fill="none"
          :stroke="colorClasses[wire.color]?.wire || '#6b7280'"
          stroke-width="0.15"
          stroke-opacity="0.6"
          stroke-linecap="round"
          stroke-dasharray="0.4 0.3"
        />
      </svg>

      <!-- Nodes -->
      <div class="absolute inset-0">
        <div
          v-for="node in nodes"
          :key="node.id"
          class="node-card absolute transform -translate-x-1/2 -translate-y-1/2 transition-all"
          :class="[
            draggingNodeId === node.id
              ? 'z-50 cursor-grabbing duration-0'
              : 'cursor-grab duration-150',
            expandedNodeId === node.id && 'z-40'
          ]"
          :style="{
            left: `${getNodePosition(node.id).x}%`,
            top: `${getNodePosition(node.id).y}%`
          }"
          @mousedown="startNodeDrag($event, node.id)"
          @click="toggleNodeExpansion(node.id)"
        >
          <div
            class="rounded-xl shadow-md border-2 overflow-hidden transition-all duration-200"
            :class="[
              getCardWidth(node.tier, expandedNodeId === node.id),
              node.tier === 0
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/30 border-yellow-400 dark:border-yellow-500'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700',
              draggingNodeId === node.id && 'shadow-xl ring-2 ring-primary-400'
            ]"
          >
            <!-- Header -->
            <div
              class="px-2 py-1 text-[8px] font-semibold uppercase tracking-wider flex items-center gap-1"
              :class="colorClasses[node.color]?.light"
            >
              <UIcon
                :name="node.icon"
                class="w-3 h-3"
                :class="colorClasses[node.color]?.text"
              />
              <span :class="colorClasses[node.color]?.text">{{
                node.category || node.source
              }}</span>
            </div>

            <!-- Body -->
            <div class="px-2 py-1.5">
              <div
                class="text-[9px] font-medium text-gray-600 dark:text-gray-300 truncate flex items-center gap-1"
              >
                {{ node.label }}
                <!-- Impact Info Icon -->
                <UTooltip
                  v-if="node.contribution"
                  :text="node.contribution"
                  :popper="{ placement: 'top' }"
                >
                  <UIcon
                    name="i-lucide-info"
                    class="w-3 h-3 text-gray-400 hover:text-primary-500 cursor-help transition-colors shrink-0"
                    @click.stop
                  />
                </UTooltip>
              </div>
              <div
                class="text-base font-bold tabular-nums"
                :class="
                  node.tier === 0
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-900 dark:text-white'
                "
              >
                {{ formatNumber(node.value) }}
              </div>

              <!-- Expanded explanation -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                leave-active-class="transition-all duration-150 ease-in"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-24"
                leave-from-class="opacity-100 max-h-24"
                leave-to-class="opacity-0 max-h-0"
              >
                <div
                  v-if="expandedNodeId === node.id"
                  class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 overflow-hidden"
                >
                  <div
                    class="text-[9px] text-gray-500 dark:text-gray-400 leading-relaxed"
                  >
                    <span class="font-medium text-gray-700 dark:text-gray-200">Impact:</span>
                    {{ node.contribution }}
                  </div>
                </div>
              </Transition>
            </div>

            <!-- North Star badge -->
            <div
              v-if="node.tier === 0"
              class="px-2 pb-1.5 text-[8px] text-yellow-600 dark:text-yellow-400 flex items-center gap-1"
            >
              <span>⭐</span> <span>Primary Goal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dotted-bg {
  background-image: radial-gradient(circle, #64748b 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
