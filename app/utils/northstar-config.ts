/**
 * NorthStarWeb Configuration
 *
 * Extracted from NorthStarWeb.vue to reduce component size and improve performance.
 * Static data that doesn't need to be in the reactive component.
 */

export interface NodeConfig {
  id: string
  label: string
  source: string
  icon: string
  color: string
  tier: number
  parent?: string
  contribution?: string
  category?: string
}

// Default node positions (percentage-based)
export const NODE_POSITIONS: Record<string, { x: number, y: number }> = {
  // North Star at top center
  stars: { x: 50, y: 8 },
  // Tier 1: 5 categories
  effort: { x: 10, y: 35 },
  exposure: { x: 30, y: 35 },
  followers: { x: 50, y: 35 },
  engagement: { x: 70, y: 35 },
  content: { x: 90, y: 35 },
  // Tier 2: Staggered positions
  contributions: { x: 5, y: 60 },
  commits: { x: 15, y: 75 },
  downloads: { x: 25, y: 60 },
  views: { x: 35, y: 75 },
  ghFollowers: { x: 45, y: 60 },
  devtoFollowers: { x: 55, y: 75 },
  reactions: { x: 65, y: 60 },
  comments: { x: 75, y: 75 },
  articles: { x: 85, y: 60 },
  reading: { x: 95, y: 75 }
}

// Static node configurations (without values - those come from props)
export const NODE_CONFIGS: NodeConfig[] = [
  {
    id: 'stars',
    label: 'GitHub Stars',
    source: 'GitHub',
    icon: 'i-lucide-star',
    color: 'yellow',
    tier: 0,
    category: 'North Star',
    contribution: 'The ultimate measure of peer-recognized technical value. Stars represent developers who found your work valuable enough to bookmark.'
  },
  {
    id: 'effort',
    label: 'Effort',
    source: 'blog + eslint',
    icon: 'i-lucide-hammer',
    color: 'orange',
    tier: 1,
    category: 'Leading Input',
    contribution: 'Active development signals project health → attracts contributors → more eyes on code → increases star probability'
  },
  {
    id: 'exposure',
    label: 'Exposure',
    source: 'Multi-Platform',
    icon: 'i-lucide-eye',
    color: 'blue',
    tier: 1,
    category: 'Discovery',
    contribution: 'Visibility creates discovery → readers find the repo → impressed developers star it'
  },
  {
    id: 'followers',
    label: 'Followers',
    source: 'GitHub + Dev.to',
    icon: 'i-lucide-users',
    color: 'purple',
    tier: 1,
    category: 'Network',
    contribution: 'Followers see new activity in their feed → amplifies reach → network effect drives stars'
  },
  {
    id: 'engagement',
    label: 'Engagement',
    source: 'Dev.to',
    icon: 'i-lucide-heart',
    color: 'pink',
    tier: 1,
    category: 'Social Proof',
    contribution: 'Community validation → builds reputation → establishes credibility → trusted projects get starred'
  },
  {
    id: 'content',
    label: 'Content',
    source: 'Dev.to',
    icon: 'i-lucide-book-open',
    color: 'green',
    tier: 1,
    category: 'Knowledge Sharing',
    contribution: 'Educational content establishes expertise → readers trust recommendations → more likely to star linked projects'
  },
  // Tier 2 nodes
  {
    id: 'contributions',
    label: 'Contributions',
    source: 'blog + eslint',
    icon: 'i-lucide-git-pull-request',
    color: 'orange',
    tier: 2,
    parent: 'effort',
    contribution: 'PRs, issues, and reviews show the project is actively maintained → builds trust → users more likely to star'
  },
  {
    id: 'commits',
    label: 'Commits',
    source: 'blog + eslint',
    icon: 'i-lucide-git-commit',
    color: 'orange',
    tier: 2,
    parent: 'effort',
    contribution: 'Regular commits demonstrate consistent improvement → developers trust actively maintained projects'
  },
  {
    id: 'downloads',
    label: 'Downloads',
    source: 'npm',
    icon: 'i-simple-icons-npm',
    color: 'blue',
    tier: 2,
    parent: 'exposure',
    contribution: 'Package downloads validate real utility → users who find value often return to star the repo'
  },
  {
    id: 'views',
    label: 'Views',
    source: 'Dev.to',
    icon: 'i-lucide-eye',
    color: 'blue',
    tier: 2,
    parent: 'exposure',
    contribution: 'Article views drive awareness → readers discover linked repos → increased star probability'
  },
  {
    id: 'ghFollowers',
    label: 'GH Followers',
    source: 'GitHub',
    icon: 'i-simple-icons-github',
    color: 'purple',
    tier: 2,
    parent: 'followers',
    contribution: 'GitHub followers see new repos in their feed → first to discover and star new projects'
  },
  {
    id: 'devtoFollowers',
    label: 'Dev.to Followers',
    source: 'Dev.to',
    icon: 'i-simple-icons-devdotto',
    color: 'purple',
    tier: 2,
    parent: 'followers',
    contribution: 'Dev.to followers read new articles → discover repo links → cross-platform conversion to stars'
  },
  {
    id: 'reactions',
    label: 'Reactions',
    source: 'Dev.to',
    icon: 'i-lucide-heart',
    color: 'pink',
    tier: 2,
    parent: 'engagement',
    contribution: 'Likes signal quality content → algorithms boost visibility → more readers discover the repo'
  },
  {
    id: 'comments',
    label: 'Comments',
    source: 'Dev.to',
    icon: 'i-lucide-message-circle',
    color: 'pink',
    tier: 2,
    parent: 'engagement',
    contribution: 'Discussion builds community → shows author is responsive → establishes trust and authority'
  },
  {
    id: 'articles',
    label: 'Articles',
    source: 'Dev.to',
    icon: 'i-lucide-file-text',
    color: 'green',
    tier: 2,
    parent: 'content',
    contribution: 'Published articles demonstrate expertise → readers explore linked repositories'
  },
  {
    id: 'reading',
    label: 'Reading Mins',
    source: 'Estimated',
    icon: 'i-lucide-clock',
    color: 'green',
    tier: 2,
    parent: 'content',
    contribution: 'Time readers spend consuming content correlates with depth of engagement → deeper trust → stars'
  }
]

// Color classes mapping
export const COLOR_CLASSES: Record<string, { text: string, wire: string, light: string, border: string }> = {
  yellow: {
    text: 'text-yellow-500',
    wire: '#facc15',
    light: 'bg-yellow-50 dark:bg-yellow-900/30',
    border: 'border-yellow-400'
  },
  orange: {
    text: 'text-orange-500',
    wire: '#f97316',
    light: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-400'
  },
  blue: {
    text: 'text-blue-500',
    wire: '#3b82f6',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-400'
  },
  purple: {
    text: 'text-purple-500',
    wire: '#a855f7',
    light: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-400'
  },
  pink: {
    text: 'text-pink-500',
    wire: '#ec4899',
    light: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-400'
  },
  green: {
    text: 'text-green-500',
    wire: '#22c55e',
    light: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-400'
  }
}

// Pre-computed wire connections (static topology)
export const WIRE_CONNECTIONS = [
  // Tier 1 to North Star
  { from: 'effort', to: 'stars', color: 'orange' },
  { from: 'exposure', to: 'stars', color: 'blue' },
  { from: 'followers', to: 'stars', color: 'purple' },
  { from: 'engagement', to: 'stars', color: 'pink' },
  { from: 'content', to: 'stars', color: 'green' },
  // Tier 2 to Tier 1
  { from: 'contributions', to: 'effort', color: 'orange' },
  { from: 'commits', to: 'effort', color: 'orange' },
  { from: 'downloads', to: 'exposure', color: 'blue' },
  { from: 'views', to: 'exposure', color: 'blue' },
  { from: 'ghFollowers', to: 'followers', color: 'purple' },
  { from: 'devtoFollowers', to: 'followers', color: 'purple' },
  { from: 'reactions', to: 'engagement', color: 'pink' },
  { from: 'comments', to: 'engagement', color: 'pink' },
  { from: 'articles', to: 'content', color: 'green' },
  { from: 'reading', to: 'content', color: 'green' }
]

// Helper to format numbers (static utility)
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toLocaleString()
}

// Card width helper
export const getCardWidth = (tier: number, isExpanded: boolean): string => {
  if (isExpanded) return 'w-56'
  if (tier === 0) return 'w-36'
  if (tier === 1) return 'w-28'
  return 'w-24'
}
