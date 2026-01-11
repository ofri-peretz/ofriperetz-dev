/**
 * Unified Homepage Stats API
 *
 * Bundles all homepage metrics into a single API response to eliminate
 * waterfall requests. This significantly improves LCP and TTI.
 *
 * Previously the homepage made 4+ separate API calls:
 * - /api/github-stats
 * - /api/npm-stats
 * - /api/devto-articles
 * - /api/devto-stats
 *
 * Now all data is fetched in parallel server-side and returned together.
 */

import { getCache, setCache, CACHE_TTL } from '../utils/cache'
import { GITHUB_CONFIG } from '../utils/metrics-config'

// Type definitions
interface GitHubData {
  totalStars: number
  totalForks: number
  totalRepos: number
  followers: number
  recentCommits: number
  totalContributions: number
  starsBreakdown: Array<{ name: string, stars: number, url: string }>
  authenticated: boolean
}

interface NpmData {
  totalDownloads: number
  packageCount: number
}

interface DevToData {
  totalViews: number
  followers: number
  articleCount: number
  totalReactions: number
  totalComments: number
  totalReadingMinutes: number
}

interface HomepageStatsResponse {
  github: GitHubData
  npm: NpmData
  devto: DevToData
  source: 'api' | 'cache' | 'fallback'
  fetchedAt?: string
}

interface RuntimeConfig {
  githubToken?: string
  devtoApiKey?: string
}

// Fallback data for graceful degradation
const FALLBACK_DATA: HomepageStatsResponse = {
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

export default defineEventHandler(async (): Promise<HomepageStatsResponse> => {
  const config = useRuntimeConfig() as RuntimeConfig

  // Check for unified cache first
  const cacheKey = 'homepage:unified-stats'
  const cached = getCache<HomepageStatsResponse>(cacheKey)
  if (cached) {
    return { ...cached, source: 'cache' }
  }

  // Fetch all data sources in parallel
  const [githubResult, npmResult, devtoResult] = await Promise.allSettled([
    fetchGitHubData(config),
    fetchNpmData(),
    fetchDevToData()
  ])

  const github: GitHubData = githubResult.status === 'fulfilled'
    ? githubResult.value
    : FALLBACK_DATA.github

  const npm: NpmData = npmResult.status === 'fulfilled'
    ? npmResult.value
    : FALLBACK_DATA.npm

  const devto: DevToData = devtoResult.status === 'fulfilled'
    ? devtoResult.value
    : FALLBACK_DATA.devto

  const result: HomepageStatsResponse = {
    github,
    npm,
    devto,
    source: 'api',
    fetchedAt: new Date().toISOString()
  }

  // Cache for 1 minute (FRESH TTL)
  setCache(cacheKey, result, CACHE_TTL.FRESH)

  return result
})

/**
 * Fetch essential GitHub data for homepage
 * Uses batched GraphQL query instead of multiple REST calls
 */
async function fetchGitHubData(config: RuntimeConfig): Promise<GitHubData> {
  const { username, targetedRepos } = GITHUB_CONFIG

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ofriperetz-dev-stats'
  }

  if (config.githubToken) {
    headers['Authorization'] = `Bearer ${config.githubToken}`
  }

  try {
    // Use GraphQL to batch all queries into one request
    if (config.githubToken) {
      const graphqlQuery = buildBatchedGraphQLQuery(username, targetedRepos)

      interface GraphQLResponse {
        data?: {
          user?: {
            followers?: { totalCount: number }
            repositories?: { totalCount: number }
            contributionsCollection?: {
              totalCommitContributions: number
              contributionCalendar?: { totalContributions: number }
            }
            [key: string]: any
          }
        }
      }

      const response = await $fetch<GraphQLResponse>('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        timeout: 8000,
        body: JSON.stringify({ query: graphqlQuery })
      })

      const user = response.data?.user
      if (user) {
        // Extract repository stats from batched query
        const repos: Array<{ name: string, stars: number, forks: number, url: string }> = []

        for (const name of targetedRepos) {
          const key = `repo_${name.replace(/-/g, '_')}`
          const repo = user[key]
          if (repo) {
            repos.push({
              name,
              stars: repo.stargazerCount || 0,
              forks: repo.forkCount || 0,
              url: repo.url || ''
            })
          }
        }

        const totalStars = repos.reduce((sum: number, r) => sum + r.stars, 0)
        const totalForks = repos.reduce((sum: number, r) => sum + r.forks, 0)

        return {
          totalStars,
          totalForks,
          totalRepos: user.repositories?.totalCount || 0,
          followers: user.followers?.totalCount || 0,
          recentCommits: user.contributionsCollection?.totalCommitContributions || 0,
          totalContributions: user.contributionsCollection?.contributionCalendar?.totalContributions || 0,
          starsBreakdown: repos.map(r => ({ name: r.name, stars: r.stars, url: r.url })),
          authenticated: true
        }
      }
    }

    // Fallback to REST API if no token
    interface GitHubUser {
      followers: number
    }

    interface GitHubRepo {
      name: string
      fork: boolean
      stargazers_count: number
      forks_count: number
      html_url: string
    }

    const [userResponse, reposResponse] = await Promise.all([
      $fetch<GitHubUser>(`https://api.github.com/users/${username}`, { headers, timeout: 5000 }),
      $fetch<GitHubRepo[]>(`https://api.github.com/users/${username}/repos?per_page=100`, { headers, timeout: 5000 })
    ])

    const targetedRepoData = (reposResponse || [])
      .filter((r: GitHubRepo) => !r.fork && targetedRepos.includes(r.name))

    return {
      totalStars: targetedRepoData.reduce((sum: number, r: GitHubRepo) => sum + r.stargazers_count, 0),
      totalForks: targetedRepoData.reduce((sum: number, r: GitHubRepo) => sum + r.forks_count, 0),
      totalRepos: (reposResponse || []).filter((r: GitHubRepo) => !r.fork).length,
      followers: userResponse?.followers || 0,
      recentCommits: 0,
      totalContributions: 0,
      starsBreakdown: targetedRepoData.map((r: GitHubRepo) => ({
        name: r.name,
        stars: r.stargazers_count,
        url: r.html_url
      })),
      authenticated: false
    }
  } catch (error) {
    console.error('[homepage-stats] GitHub fetch error:', error)
    throw error
  }
}

/**
 * Build a single GraphQL query that fetches all repo data at once
 * This replaces N+1 REST API calls with one GraphQL call
 */
function buildBatchedGraphQLQuery(username: string, repos: readonly string[]): string {
  const repoQueries = repos.map((name) => {
    const safeAlias = `repo_${name.replace(/-/g, '_')}`
    return `
      ${safeAlias}: repository(owner: "${username}", name: "${name}") {
        name
        stargazerCount
        forkCount
        url
      }
    `
  }).join('\n')

  return `
    query {
      user(login: "${username}") {
        followers { totalCount }
        repositories(first: 1, privacy: PUBLIC) { totalCount }
        contributionsCollection {
          totalCommitContributions
          contributionCalendar {
            totalContributions
          }
        }
        ${repoQueries}
      }
    }
  `
}

/**
 * Fetch npm download stats
 */
async function fetchNpmData(): Promise<NpmData> {
  try {
    interface NpmStatsResponse {
      totalDownloads?: number
      packageCount?: number
    }

    const response = await $fetch<NpmStatsResponse>('/api/npm-stats', {
      timeout: 8000
    })

    return {
      totalDownloads: response?.totalDownloads || 0,
      packageCount: response?.packageCount || 0
    }
  } catch (error) {
    console.error('[homepage-stats] npm fetch error:', error)
    throw error
  }
}

/**
 * Fetch Dev.to stats (views + followers)
 */
async function fetchDevToData(): Promise<DevToData> {
  try {
    interface DevToArticlesResponse {
      articles?: Array<any>
    }

    interface DevToStatsResponse {
      followers?: number
      totalViews?: number
    }

    // Fetch both articles and stats in parallel
    const [articlesResponse, statsResponse] = await Promise.allSettled([
      $fetch<DevToArticlesResponse>('/api/devto-articles', { timeout: 8000 }),
      $fetch<DevToStatsResponse>('/api/devto-stats', { timeout: 8000 })
    ])

    const articles = articlesResponse.status === 'fulfilled'
      ? articlesResponse.value?.articles || []
      : []

    const stats = statsResponse.status === 'fulfilled'
      ? statsResponse.value
      : { followers: 85, totalViews: 1834 }

    // Aggregate engagement from articles
    const totalReactions = articles.reduce((sum, a) => sum + (a.positive_reactions_count || 0), 0)
    const totalComments = articles.reduce((sum, a) => sum + (a.comments_count || 0), 0)
    const totalReadingMinutes = articles.reduce((sum, a) => sum + (a.reading_time_minutes || 0), 0)

    return {
      totalViews: stats?.totalViews || 0,
      followers: stats?.followers || 85,
      articleCount: articles.length,
      totalReactions,
      totalComments,
      totalReadingMinutes
    }
  } catch (error) {
    console.error('[homepage-stats] DevTo fetch error:', error)
    throw error
  }
}
