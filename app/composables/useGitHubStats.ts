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

export interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: {
    name: string
  }
  payload: {
    commits?: { message: string }[]
    action?: string
    pull_request?: { title: string }
    issue?: { title: string }
    review?: { state: string }
  }
}

export interface GitHubContribution {
  date: string
  count: number
  level: number // 0-4 for intensity
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
  // Activity stats from events
  recentCommits: number
  recentPRs: number
  recentIssues: number
  recentReviews: number
  activityBreakdown: {
    commits: number
    pullRequests: number
    codeReviews: number
    issues: number
  }
  recentEvents: { type: string; repo: string; date: string; message: string }[]
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
    languages: [],
    recentCommits: 0,
    recentPRs: 0,
    recentIssues: 0,
    recentReviews: 0,
    activityBreakdown: {
      commits: 0,
      pullRequests: 0,
      codeReviews: 0,
      issues: 0
    },
    recentEvents: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async (username: string = 'ofri-peretz') => {
    loading.value = true
    error.value = null

    try {
      // Fetch user profile, repos, and events in parallel
      const [user, repos, events] = await Promise.all([
        $fetch<GitHubUser>(`https://api.github.com/users/${username}`),
        $fetch<GitHubRepo[]>(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`),
        $fetch<GitHubEvent[]>(`https://api.github.com/users/${username}/events/public?per_page=100`)
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
      
      // Process events for activity breakdown
      let commits = 0
      let pullRequests = 0
      let codeReviews = 0
      let issues = 0
      const recentEvents: { type: string; repo: string; date: string; message: string }[] = []
      
      events.forEach(event => {
        const repoName = event.repo.name.split('/')[1] || event.repo.name
        
        switch (event.type) {
          case 'PushEvent':
            const commitCount = event.payload?.commits?.length || 0
            commits += commitCount
            if (recentEvents.length < 10 && commitCount > 0) {
              recentEvents.push({
                type: 'commit',
                repo: repoName,
                date: event.created_at,
                message: `${commitCount} commit${commitCount > 1 ? 's' : ''}`
              })
            }
            break
          case 'PullRequestEvent':
            if (event.payload?.action === 'opened' || event.payload?.action === 'closed') {
              pullRequests++
              if (recentEvents.length < 10) {
                recentEvents.push({
                  type: 'pr',
                  repo: repoName,
                  date: event.created_at,
                  message: event.payload?.pull_request?.title || 'Pull request'
                })
              }
            }
            break
          case 'PullRequestReviewEvent':
            codeReviews++
            if (recentEvents.length < 10) {
              recentEvents.push({
                type: 'review',
                repo: repoName,
                date: event.created_at,
                message: `Code review: ${event.payload?.review?.state || 'reviewed'}`
              })
            }
            break
          case 'IssuesEvent':
            issues++
            if (recentEvents.length < 10) {
              recentEvents.push({
                type: 'issue',
                repo: repoName,
                date: event.created_at,
                message: event.payload?.issue?.title || 'Issue'
              })
            }
            break
          case 'IssueCommentEvent':
            // Count issue comments as part of issues activity
            issues++
            break
          case 'CreateEvent':
          case 'DeleteEvent':
          case 'WatchEvent':
          case 'ForkEvent':
            // These are less interesting for activity stats
            break
        }
      })
      
      stats.value = {
        totalStars,
        totalForks,
        totalRepos: ownRepos.length,
        followers: user.followers,
        publicRepos: user.public_repos,
        topRepos,
        recentActivity,
        languages,
        recentCommits: commits,
        recentPRs: pullRequests,
        recentIssues: issues,
        recentReviews: codeReviews,
        activityBreakdown: {
          commits,
          pullRequests,
          codeReviews,
          issues
        },
        recentEvents
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
