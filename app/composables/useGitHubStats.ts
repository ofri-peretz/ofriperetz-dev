export interface GitHubRepo {
  name: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  language: string | null
  description: string | null
  html_url: string
}

export interface GitHubStats {
  totalStars: number
  totalForks: number
  totalRepos: number
  topRepos: GitHubRepo[]
}

export const useGitHubStats = () => {
  const stats = ref<GitHubStats>({
    totalStars: 0,
    totalForks: 0,
    totalRepos: 0,
    topRepos: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async (username: string = 'ofri-peretz') => {
    loading.value = true
    error.value = null

    try {
      const repos = await $fetch<GitHubRepo[]>(
        `https://api.github.com/users/${username}/repos?per_page=100`
      )
      
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0)
      
      // Get top repos by stars
      const topRepos = repos
        .filter(r => !r.name.includes('fork'))
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
      
      stats.value = {
        totalStars,
        totalForks,
        totalRepos: repos.length,
        topRepos
      }
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
