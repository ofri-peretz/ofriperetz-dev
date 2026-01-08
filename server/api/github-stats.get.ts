import { getCache, setCache, CACHE_TTL } from '../utils/cache'
import { GITHUB_CONFIG } from '../utils/metrics-config'

// Fallback data with real stats (updated manually when needed)
const FALLBACK_STATS = {
  totalStars: 11,
  totalForks: 2,
  totalWatchers: 35,
  totalRepos: 35,
  followers: 51,
  following: 30,
  publicRepos: 35,
  accountAgeYears: 9,
  totalContributions: 1799,
  recentCommits: 477,
  recentPRs: 319,
  recentIssues: 168,
  recentRepos: 35,
  recentReviews: 0,
  contributionCalendar: [],
  topRepos: [
    { name: 'eslint-plugin-secure-coding', stars: 3, forks: 0, url: 'https://github.com/ofri-peretz/eslint-plugin-secure-coding', description: 'Security-focused ESLint rules' }
  ],
  languages: [
    { name: 'TypeScript', count: 25 },
    { name: 'JavaScript', count: 8 },
    { name: 'Vue', count: 2 }
  ],
  authenticated: false,
  source: 'fallback' as const
}

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig()
  const { username, targetedRepos } = GITHUB_CONFIG

  // Check cache first - use FRESH TTL (1 min) for GitHub stats
  const cacheKey = 'github:full-stats'
  const cached = getCache<typeof FALLBACK_STATS>(cacheKey)
  if (cached) {
    return { ...cached, source: 'cache' as const }
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ofriperetz-dev-stats'
  }

  // Add auth header if token is configured
  if (config.githubToken) {
    headers['Authorization'] = `Bearer ${config.githubToken}`
  }

  try {
    // Fetch REST API data with timeout
    const [user, repos] = await Promise.all([
      $fetch<{
        public_repos: number
        followers: number
        following: number
        created_at: string
      }>(`https://api.github.com/users/${username}`, {
        headers,
        timeout: 10000
      }),

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
      }>>(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
        headers,
        timeout: 10000
      })
    ])

    // If we have a token, use GraphQL for contribution data
    let contributionStats = {
      totalContributions: FALLBACK_STATS.totalContributions,
      contributionCalendar: [] as { date: string, count: number }[],
      totalCommitContributions: FALLBACK_STATS.recentCommits,
      totalPullRequestContributions: FALLBACK_STATS.recentPRs,
      totalIssueContributions: FALLBACK_STATS.recentIssues,
      totalRepositoryContributions: FALLBACK_STATS.recentRepos
    }

    if (config.githubToken) {
      // Check for cached contribution data (use STANDARD TTL since this is semi-historical)
      const contribCacheKey = 'github:contributions'
      const cachedContrib = getCache<typeof contributionStats>(contribCacheKey)

      if (cachedContrib) {
        contributionStats = cachedContrib
      } else {
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
            timeout: 10000,
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

            // Cache contribution stats for 5 minutes
            setCache(contribCacheKey, contributionStats, CACHE_TTL.STANDARD)
          }
        } catch (graphqlError) {
          console.error('GraphQL error, using fallback contribution stats:', graphqlError)
        }
      }
    }

    // Filter out forks for stats
    const ownRepos = repos.filter(r => !r.fork)

    // For stars/forks/watchers, only count from targeted repos
    const targetedRepoData = ownRepos.filter(r => (targetedRepos as readonly string[]).includes(r.name))
    const totalStars = targetedRepoData.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = targetedRepoData.reduce((sum, repo) => sum + repo.forks_count, 0)
    const totalWatchers = targetedRepoData.reduce((sum, repo) => sum + repo.watchers_count, 0)

    // Stars breakdown by repo
    const starsBreakdown = targetedRepoData.map(r => ({
      name: r.name,
      stars: r.stargazers_count,
      url: r.html_url
    }))

    // Top repos by stars (only from targeted repos for consistency)
    const topRepos = [...targetedRepoData]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .map(r => ({
        name: r.name,
        stars: r.stargazers_count,
        forks: r.forks_count,
        url: r.html_url,
        description: r.description
      }))

    // Aggregate languages (only from targeted repos for consistency)
    const langMap: Record<string, number> = {}
    targetedRepoData.forEach((repo) => {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + 1
      }
    })
    const languages = Object.entries(langMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Count commits and contributions only from targeted repos using search API
    let targetedCommits = 0
    let targetedContributions = 0

    if (config.githubToken) {
      // Check for cached commit counts (use HISTORICAL TTL for past commits)
      const commitsCacheKey = 'github:targeted-commits'
      const cachedCommits = getCache<{ commits: number, contributions: number }>(commitsCacheKey)

      if (cachedCommits) {
        targetedCommits = cachedCommits.commits
        targetedContributions = cachedCommits.contributions
      } else {
        try {
          // Search for commits in targeted repos
          for (const repoName of targetedRepos) {
            try {
              const commitSearch = await $fetch<{
                total_count: number
              }>(`https://api.github.com/search/commits?q=author:${username}+repo:${username}/${repoName}`, {
                headers: {
                  ...headers,
                  Accept: 'application/vnd.github.cloak-preview+json'
                },
                timeout: 10000
              })
              targetedCommits += commitSearch.total_count || 0
            } catch (e) {
              console.error(`Error counting commits for ${repoName}:`, e)
            }
          }

          // For contributions, we'll estimate based on PRs and issues in targeted repos
          for (const repoName of targetedRepos) {
            try {
              const [prSearch, issueSearch] = await Promise.all([
                $fetch<{ total_count: number }>(`https://api.github.com/search/issues?q=author:${username}+repo:${username}/${repoName}+type:pr`, {
                  headers,
                  timeout: 10000
                }),
                $fetch<{ total_count: number }>(`https://api.github.com/search/issues?q=author:${username}+repo:${username}/${repoName}+type:issue`, {
                  headers,
                  timeout: 10000
                })
              ])
              targetedContributions += (prSearch.total_count || 0) + (issueSearch.total_count || 0)
            } catch (e) {
              console.error(`Error counting contributions for ${repoName}:`, e)
            }
          }

          // Add commits to contributions total
          targetedContributions += targetedCommits

          // Cache commit counts for 24 hours (historical data)
          setCache(commitsCacheKey, { commits: targetedCommits, contributions: targetedContributions }, CACHE_TTL.HISTORICAL)
        } catch (e) {
          console.error('Error fetching targeted repo stats:', e)
          targetedCommits = contributionStats.totalCommitContributions
          targetedContributions = contributionStats.totalContributions
        }
      }
    } else {
      targetedCommits = contributionStats.totalCommitContributions
      targetedContributions = contributionStats.totalContributions
    }

    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
    )

    const result = {
      // Basic stats (from targeted repos only)
      totalStars,
      totalForks,
      totalWatchers,
      starsBreakdown,
      totalRepos: ownRepos.length,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      accountAgeYears: accountAge,

      // Contribution stats (filtered to targeted repos only)
      totalContributions: targetedContributions,
      recentCommits: targetedCommits,
      recentPRs: contributionStats.totalPullRequestContributions,
      recentIssues: contributionStats.totalIssueContributions,
      recentRepos: contributionStats.totalRepositoryContributions,
      recentReviews: 0,
      contributionCalendar: contributionStats.contributionCalendar,

      // Enriched data
      topRepos,
      languages,

      authenticated: !!config.githubToken,
      source: 'api' as const
    }

    // Cache the full result for 1 minute
    setCache(cacheKey, result, CACHE_TTL.FRESH)

    return result
  } catch (error) {
    console.error('Failed to fetch GitHub stats, returning fallback:', error)

    // Check if we have any cached data
    const cached = getCache<typeof FALLBACK_STATS>(cacheKey)
    if (cached) {
      return { ...cached, source: 'cache' as const }
    }

    return FALLBACK_STATS
  }
})
