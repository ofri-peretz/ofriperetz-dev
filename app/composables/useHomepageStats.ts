/**
 * useHomepageStats composable
 *
 * Fetches all homepage metrics in a single API call.
 * This replaces the pattern of calling useGitHubStats, useNpmStats,
 * and useDevToArticles separately on the homepage.
 */

export interface HomepageStats {
  github: {
    totalStars: number
    totalForks: number
    totalRepos: number
    followers: number
    recentCommits: number
    totalContributions: number
    starsBreakdown: { name: string, stars: number, url: string }[]
    authenticated: boolean
  }
  npm: {
    totalDownloads: number
    packageCount: number
  }
  devto: {
    totalViews: number
    followers: number
    articleCount: number
    totalReactions: number
    totalComments: number
    totalReadingMinutes: number
  }
  source: 'api' | 'cache' | 'fallback'
  fetchedAt?: string
}

const FALLBACK_STATS: HomepageStats = {
  github: {
    totalStars: 11,
    totalForks: 2,
    totalRepos: 35,
    followers: 6,
    recentCommits: 477,
    totalContributions: 583,
    starsBreakdown: [],
    authenticated: false
  },
  npm: {
    totalDownloads: 9611,
    packageCount: 16
  },
  devto: {
    totalViews: 1834,
    followers: 85,
    articleCount: 28,
    totalReactions: 10,
    totalComments: 9,
    totalReadingMinutes: 100
  },
  source: 'fallback'
}

export const useHomepageStats = () => {
  const stats = ref<HomepageStats>(FALLBACK_STATS)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed helpers for easy access
  const githubStats = computed(() => stats.value.github)
  const npmStats = computed(() => stats.value.npm)
  const devtoStats = computed(() => stats.value.devto)

  const totalFollowers = computed(() =>
    stats.value.github.followers + stats.value.devto.followers
  )

  const fetchStats = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<HomepageStats>('/api/homepage-stats')

      // Merge API response with fallback values for authenticated-only fields
      // When not authenticated, the API returns 0 for contributions - use fallback instead
      stats.value = {
        ...response,
        github: {
          ...response.github,
          // Use fallback values if API returns 0 (meaning not authenticated)
          totalContributions: response.github.totalContributions || FALLBACK_STATS.github.totalContributions,
          recentCommits: response.github.recentCommits || FALLBACK_STATS.github.recentCommits
        }
      }
    } catch (e) {
      error.value = 'Failed to fetch homepage stats'
      console.error('Homepage stats error:', e)
      // Keep fallback data
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    githubStats,
    npmStats,
    devtoStats,
    totalFollowers,
    fetchStats
  }
}
