import { getCache, setCache, CACHE_TTL } from '../utils/cache'

// Fallback value - update manually from dashboard if API fails persistently
const FALLBACK_FOLLOWERS = 85
const FALLBACK_VIEWS = 1834

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  // Check cache first - use FRESH TTL (1 min)
  const cacheKey = 'devto:stats'
  const cached = getCache<{ followers: number, totalViews?: number, source: 'api' | 'cache' | 'fallback' }>(cacheKey)
  if (cached) {
    return { ...cached, source: 'cache' as const }
  }

  // If no API key configured, return fallback values
  if (!config.devtoApiKey) {
    console.warn('[devto-stats] No DEVTO_API_KEY configured, using fallback')
    return {
      followers: FALLBACK_FOLLOWERS,
      totalViews: FALLBACK_VIEWS,
      source: 'fallback' as const
    }
  }

  try {
    // 1. Fetch followers list
    const followersPromise = $fetch<Array<any>>('https://dev.to/api/followers/users', {
      headers: { 'api-key': config.devtoApiKey },
      query: { per_page: 1000 },
      timeout: 10000
    })

    // 2. Fetch authenticated articles (includes page_views_count)
    const articlesPromise = $fetch<Array<{
      id: number
      page_views_count: number
      positive_reactions_count: number
      comments_count: number
    }>>('https://dev.to/api/articles/me/all', {
      headers: { 'api-key': config.devtoApiKey },
      query: { per_page: 1000 },
      timeout: 10000
    })

    const [followers, articles] = await Promise.all([followersPromise, articlesPromise])

    const followersCount = followers?.length ?? FALLBACK_FOLLOWERS

    // Sum up views from all articles
    const totalViews = articles?.reduce((sum, article) => sum + (article.page_views_count || 0), 0) || 0

    console.log('[devto-stats] API response: followers=', followersCount, 'views=', totalViews)

    const result = {
      followers: followersCount,
      totalViews,
      source: 'api' as const
    }

    // Cache the result for 1 minute
    setCache(cacheKey, result, CACHE_TTL.FRESH)

    return result
  } catch (error) {
    console.error('[devto-stats] Failed to fetch from API:', error)

    // Check for any cached data
    const cached = getCache<{ followers: number, totalViews?: number }>(cacheKey)
    if (cached) {
      return { ...cached, source: 'cache' as const }
    }

    return {
      followers: FALLBACK_FOLLOWERS,
      totalViews: FALLBACK_VIEWS,
      source: 'fallback' as const
    }
  }
})
