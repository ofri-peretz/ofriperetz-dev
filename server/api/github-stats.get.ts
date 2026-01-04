export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const username = 'ofri-peretz'
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ofriperetz-dev-stats'
  }
  
  // Add auth header if token is configured (increases rate limit and gets private events)
  if (config.githubToken) {
    headers['Authorization'] = `Bearer ${config.githubToken}`
  }

  try {
    // Fetch user profile, repos, and events in parallel
    const [user, repos, events] = await Promise.all([
      $fetch<{
        public_repos: number
        followers: number
        following: number
      }>(`https://api.github.com/users/${username}`, { headers }),
      
      $fetch<Array<{
        name: string
        stargazers_count: number
        forks_count: number
        language: string | null
        fork: boolean
        pushed_at: string
      }>>(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers }),
      
      // With token, we get more events including private/org repos
      $fetch<Array<{
        type: string
        created_at: string
        repo: { name: string }
        payload: {
          commits?: { message: string }[]
          action?: string
          pull_request?: { title: string }
          issue?: { title: string }
          review?: { state: string }
        }
      }>>(`https://api.github.com/users/${username}/events?per_page=100`, { headers })
    ])
    
    // Filter out forks for stats
    const ownRepos = repos.filter(r => !r.fork)
    
    const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0)
    
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
        case 'IssueCommentEvent':
          issues++
          if (recentEvents.length < 10 && event.type === 'IssuesEvent') {
            recentEvents.push({
              type: 'issue',
              repo: repoName,
              date: event.created_at,
              message: event.payload?.issue?.title || 'Issue'
            })
          }
          break
      }
    })

    return {
      totalStars,
      totalForks,
      totalRepos: ownRepos.length,
      followers: user.followers,
      publicRepos: user.public_repos,
      languages,
      recentCommits: commits,
      recentPRs: pullRequests,
      recentIssues: issues,
      recentReviews: codeReviews,
      recentEvents,
      authenticated: !!config.githubToken
    }
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error)
    return {
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
      recentEvents: [],
      authenticated: false,
      error: 'Failed to fetch'
    }
  }
})
