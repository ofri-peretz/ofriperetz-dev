export interface GitHubRepo {
  name: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  language: string | null
  description: string | null
  html_url: string
  pushed_at: string
  created_at: string
  fork: boolean
}

export interface GitHubUser {
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
}

export interface GitHubStats {
  totalStars: number
  totalForks: number
  totalRepos: number
  followers: number
  publicRepos: number
  topRepos: GitHubRepo[]
  recentActivity: GitHubRepo[]
  languages: { name: string; count: number }[]
}

export const useGitHubStats = () => {
  const stats = ref<GitHubStats>({
    totalStars: 0,
    totalForks: 0,
    totalRepos: 0,
    followers: 0,
    publicRepos: 0,
    topRepos: [],
    recentActivity: [],
    languages: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async (username: string = 'ofri-peretz') => {
    loading.value = true
    error.value = null

    try {
      // Fetch user profile and repos in parallel
      const [user, repos] = await Promise.all([
        $fetch<GitHubUser>(`https://api.github.com/users/${username}`),
        $fetch<GitHubRepo[]>(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`)
      ])
      
      // Filter out forks for stats
      const ownRepos = repos.filter(r => !r.fork)
      
      const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0)
      
      // Get top repos by stars
      const topRepos = [...ownRepos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
      
      // Get recent activity (most recently pushed)
      const recentActivity = [...ownRepos]
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
        .slice(0, 5)
      
      // Aggregate languages
      const langMap: Record<string, number> = {}
      ownRepos.forEach(repo => {
        if (repo.language) {
          langMap[repo.language] = (langMap[repo.language] || 0) + 1
        }
      })
      const languages = Object.entries(langMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
      
      stats.value = {
        totalStars,
        totalForks,
        totalRepos: ownRepos.length,
        followers: user.followers,
        publicRepos: user.public_repos,
        topRepos,
        recentActivity,
        languages
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
