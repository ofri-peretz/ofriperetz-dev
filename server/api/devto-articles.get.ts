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

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  // Check cache first
  const cacheKey = 'devto:articles'
  const cached = getCache<{ articles: DevToArticle[], source: string }>(cacheKey)
  if (cached) {
    return { ...cached, source: 'cache' }
  }

  // If no API key, fall back to public API (no views)
  if (!config.devtoApiKey) {
    console.warn('[devto-articles] No DEVTO_API_KEY configured, using public API')
    try {
      const publicArticles = await $fetch<any[]>(
        'https://dev.to/api/articles?username=ofri-peretz&per_page=100',
        { timeout: 10000 }
      )
      const mapped = (publicArticles || []).map(a => ({ ...a, page_views_count: 0 }))
      return { articles: mapped, source: 'public-api' }
    } catch (e) {
      console.error('[devto-articles] Public API error:', e)
      return { articles: [], source: 'error' }
    }
  }

  try {
    // Fetch authenticated articles (includes page_views_count)
    const articles = await $fetch<DevToArticle[]>('https://dev.to/api/articles/me/all', {
      headers: { 'api-key': config.devtoApiKey },
      query: { per_page: 100 },
      timeout: 10000
    })

    // Sort by published date (most recent first)
    const sorted = (articles || [])
      .filter(a => a.published_at) // Only published articles
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

    console.log('[devto-articles] Fetched', sorted.length, 'articles with views')

    const result = { articles: sorted, source: 'api' }
    setCache(cacheKey, result, CACHE_TTL.FRESH)

    return result
  } catch (error) {
    console.error('[devto-articles] Failed to fetch from API:', error)

    // Try public API as fallback
    try {
      const publicArticles = await $fetch<any[]>(
        'https://dev.to/api/articles?username=ofri-peretz&per_page=100',
        { timeout: 10000 }
      )
      const mapped = (publicArticles || []).map(a => ({ ...a, page_views_count: 0 }))
      return { articles: mapped, source: 'fallback-public' }
    } catch {
      return { articles: [], source: 'error' }
    }
  }
})
