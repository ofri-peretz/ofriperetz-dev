/**
 * Combined Dev.to API endpoint
 *
 * Fetches articles AND stats in a single API response to eliminate duplicate requests.
 * Previously we had:
 * - /api/devto-articles (fetches articles)
 * - /api/devto-stats (fetches followers + articles again for views)
 *
 * Now returns both in one call.
 */

import { getCache, setCache, CACHE_TTL } from '../utils/cache'

interface DevToArticle {
  id: number
  title: string
  description: string
  url: string
  slug?: string
  cover_image: string | null
  social_image: string
  published_at: string
  reading_time_minutes: number
  positive_reactions_count: number
  comments_count: number
  page_views_count: number
  tag_list: string[]
  user: {
    name: string
    username: string
    profile_image: string
  }
}

interface CombinedResponse {
  articles: DevToArticle[]
  stats: {
    followers: number
    totalViews: number
  }
  source: 'api' | 'cache' | 'fallback'
}

// Fallback data
const FALLBACK_DATA: CombinedResponse = {
  articles: [],
  stats: {
    followers: 85,
    totalViews: 1834
  },
  source: 'fallback'
}

export default defineEventHandler(async (): Promise<CombinedResponse> => {
  const config = useRuntimeConfig()

  // Check cache first
  const cacheKey = 'devto:combined'
  const cached = getCache<CombinedResponse>(cacheKey)
  if (cached) {
    return { ...cached, source: 'cache' }
  }

  // If no API key, use public API (no views/followers)
  if (!config.devtoApiKey) {
    console.warn('[devto-combined] No DEVTO_API_KEY configured, using public API')
    try {
      const publicArticles = await $fetch<DevToArticle[]>(
        'https://dev.to/api/articles?username=ofri-peretz&per_page=100',
        { timeout: 10000 }
      )
      const mapped = (publicArticles || []).map(a => ({ ...a, page_views_count: 0 }))
      return {
        articles: mapped,
        stats: { followers: 85, totalViews: 1834 },
        source: 'fallback'
      }
    } catch (e) {
      console.error('[devto-combined] Public API error:', e)
      return FALLBACK_DATA
    }
  }

  try {
    // Fetch both articles and followers in parallel
    const [articlesResponse, followersResponse] = await Promise.all([
      $fetch<DevToArticle[]>('https://dev.to/api/articles/me/all', {
        headers: { 'api-key': config.devtoApiKey },
        query: { per_page: 100 },
        timeout: 10000
      }),
      $fetch<Array<any>>('https://dev.to/api/followers/users', {
        headers: { 'api-key': config.devtoApiKey },
        query: { per_page: 1000 },
        timeout: 10000
      })
    ])

    // Process articles
    const articles = (articlesResponse || [])
      .filter(a => a.published_at) // Only published
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

    // Calculate total views
    const totalViews = articles.reduce((sum, a) => sum + (a.page_views_count || 0), 0)

    // Get followers count
    const followers = followersResponse?.length ?? 45

    console.log('[devto-combined] Fetched', articles.length, 'articles, views=', totalViews, 'followers=', followers)

    const result: CombinedResponse = {
      articles,
      stats: {
        followers,
        totalViews
      },
      source: 'api'
    }

    // Cache for 1 minute
    setCache(cacheKey, result, CACHE_TTL.FRESH)

    return result
  } catch (error) {
    console.error('[devto-combined] Failed to fetch:', error)

    // Try public API as fallback
    try {
      const publicArticles = await $fetch<DevToArticle[]>(
        'https://dev.to/api/articles?username=ofri-peretz&per_page=100',
        { timeout: 10000 }
      )
      return {
        articles: (publicArticles || []).map(a => ({ ...a, page_views_count: 0 })),
        stats: { followers: 85, totalViews: 1834 },
        source: 'fallback'
      }
    } catch {
      return FALLBACK_DATA
    }
  }
})
