export interface GitHubStats {
  // Basic counts
  totalStars: number
  totalForks: number
  totalWatchers: number
  totalRepos: number
  followers: number
  following: number
  publicRepos: number
  accountAgeYears: number
  
  // Contribution stats (from GraphQL - this year)
  totalContributions: number
  recentCommits: number
  recentPRs: number
  recentIssues: number
  recentRepos: number
  
  // Contribution calendar (last 30 days)
  contributionCalendar: { date: string; count: number }[]
  
  // Enriched data
  topRepos: { name: string; stars: number; forks: number; url: string; description: string | null }[]
  languages: { name: string; count: number }[]
  
  authenticated?: boolean
}

export const useGitHubStats = () => {
  const stats = ref<GitHubStats>({
    totalStars: 0,
    totalForks: 0,
    totalWatchers: 0,
    totalRepos: 0,
    followers: 0,
    following: 0,
    publicRepos: 0,
    accountAgeYears: 0,
    totalContributions: 0,
    recentCommits: 0,
    recentPRs: 0,
    recentIssues: 0,
    recentRepos: 0,
    contributionCalendar: [],
    topRepos: [],
    languages: []
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
