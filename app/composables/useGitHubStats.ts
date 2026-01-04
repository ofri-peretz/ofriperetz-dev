export interface GitHubStats {
  totalStars: number
  totalForks: number
  totalRepos: number
  followers: number
  publicRepos: number
  languages: { name: string; count: number }[]
  recentCommits: number
  recentPRs: number
  recentIssues: number
  recentReviews: number
  recentEvents: { type: string; repo: string; date: string; message: string }[]
  authenticated?: boolean
}

export const useGitHubStats = () => {
  const stats = ref<GitHubStats>({
    totalStars: 0,
    totalForks: 0,
    totalRepos: 0,
    followers: 0,
    publicRepos: 0,
    languages: [],
    recentCommits: 0,
    recentPRs: 0,
    recentIssues: 0,
    recentReviews: 0,
    recentEvents: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async () => {
    loading.value = true
    error.value = null

    try {
      // Fetch from server API (secure - uses token server-side)
      const response = await $fetch<GitHubStats>('/api/github-stats')
      stats.value = response
    } catch (e) {
      error.value = 'Failed to fetch GitHub stats'
      console.error('GitHub stats error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}
