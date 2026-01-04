export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const username = 'ofri-peretz'
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ofriperetz-dev-stats'
  }
  
  // Add auth header if token is configured
  if (config.githubToken) {
    headers['Authorization'] = `Bearer ${config.githubToken}`
  }

  try {
    // Fetch REST API data
    const [user, repos] = await Promise.all([
      $fetch<{
        public_repos: number
        followers: number
        following: number
        created_at: string
      }>(`https://api.github.com/users/${username}`, { headers }),
      
      $fetch<Array<{
        name: string
        stargazers_count: number
        forks_count: number
        watchers_count: number
        language: string | null
        fork: boolean
        pushed_at: string
        html_url: string
        description: string | null
      }>>(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers })
    ])
    
    // If we have a token, use GraphQL for contribution data
    let contributionStats = {
      totalContributions: 0,
      contributionCalendar: [] as { date: string; count: number }[],
      totalCommitContributions: 0,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
      totalRepositoryContributions: 0
    }
    
    if (config.githubToken) {
      try {
        const graphqlResponse = await $fetch<{
          data: {
            user: {
              contributionsCollection: {
                totalCommitContributions: number
                totalPullRequestContributions: number
                totalIssueContributions: number
                totalRepositoryContributions: number
                contributionCalendar: {
                  totalContributions: number
                  weeks: Array<{
                    contributionDays: Array<{
                      date: string
                      contributionCount: number
                    }>
                  }>
                }
              }
            }
          }
        }>('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `
              query {
                user(login: "${username}") {
                  contributionsCollection {
                    totalCommitContributions
                    totalPullRequestContributions
                    totalIssueContributions
                    totalRepositoryContributions
                    contributionCalendar {
                      totalContributions
                      weeks {
                        contributionDays {
                          date
                          contributionCount
                        }
                      }
                    }
                  }
                }
              }
            `
          })
        })
        
        const collection = graphqlResponse.data?.user?.contributionsCollection
        if (collection) {
          contributionStats = {
            totalContributions: collection.contributionCalendar.totalContributions,
            totalCommitContributions: collection.totalCommitContributions,
            totalPullRequestContributions: collection.totalPullRequestContributions,
            totalIssueContributions: collection.totalIssueContributions,
            totalRepositoryContributions: collection.totalRepositoryContributions,
            contributionCalendar: collection.contributionCalendar.weeks
              .flatMap(w => w.contributionDays)
              .slice(-30) // Last 30 days
              .map(d => ({ date: d.date, count: d.contributionCount }))
          }
        }
      } catch (graphqlError) {
        console.error('GraphQL error:', graphqlError)
      }
    }
    
    // Filter out forks for stats
    const ownRepos = repos.filter(r => !r.fork)
    
    const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0)
    const totalWatchers = ownRepos.reduce((sum, repo) => sum + repo.watchers_count, 0)
    
    // Top 5 repos by stars
    const topRepos = [...ownRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map(r => ({
        name: r.name,
        stars: r.stargazers_count,
        forks: r.forks_count,
        url: r.html_url,
        description: r.description
      }))
    
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
    
    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
    )

    return {
      // Basic stats
      totalStars,
      totalForks,
      totalWatchers,
      totalRepos: ownRepos.length,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      accountAgeYears: accountAge,
      
      // Contribution stats (from GraphQL - accurate!)
      totalContributions: contributionStats.totalContributions,
      recentCommits: contributionStats.totalCommitContributions,
      recentPRs: contributionStats.totalPullRequestContributions,
      recentIssues: contributionStats.totalIssueContributions,
      recentRepos: contributionStats.totalRepositoryContributions,
      contributionCalendar: contributionStats.contributionCalendar,
      
      // Enriched data
      topRepos,
      languages,
      
      authenticated: !!config.githubToken
    }
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error)
    return {
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
      languages: [],
      authenticated: false,
      error: 'Failed to fetch'
    }
  }
})
