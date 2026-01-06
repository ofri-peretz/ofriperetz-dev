// Cache to avoid rate limiting and ensure fresh data
const cachedDevToStats = {
  lastFetched: 0,
  data: null as { followers: number; source: 'api' | 'cache' | 'fallback' } | null
}

// Fallback value - update manually from dashboard if API fails persistently
const FALLBACK_FOLLOWERS = 45

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache

  // Return cached data if fresh
  if (cachedDevToStats.data && (Date.now() - cachedDevToStats.lastFetched) < CACHE_TTL) {
    return { ...cachedDevToStats.data, source: 'cache' as const }
  }

  // If no API key configured, return fallback values
  if (!config.devtoApiKey) {
    console.warn('[devto-stats] No DEVTO_API_KEY configured, using fallback')
    return {
      followers: FALLBACK_FOLLOWERS,
      source: 'fallback' as const
    }
  }

  try {
    // Fetch followers list from dev.to API (requires authentication)
    // Note: /api/users/me does NOT return followers_count
    // We must use /api/followers/users and count the results
    const followers = await $fetch<Array<{
      id: number
      user_id: number
      name: string
      path: string
      username: string
      profile_image: string
    }>>('https://dev.to/api/followers/users', {
      headers: {
        'api-key': config.devtoApiKey
      },
      query: {
        per_page: 1000 // Max per page to get all followers in one request
      },
      timeout: 10000
    })

    const followersCount = followers?.length ?? FALLBACK_FOLLOWERS

    console.log('[devto-stats] API response: followers count =', followersCount)

    const result = {
      followers: followersCount,
      source: 'api' as const
    }

    // Cache the result
    cachedDevToStats.data = result
    cachedDevToStats.lastFetched = Date.now()

    return result
  } catch (error) {
    console.error('[devto-stats] Failed to fetch from API:', error)
    
    // Return cached data if available, otherwise fallback
    if (cachedDevToStats.data) {
      return { ...cachedDevToStats.data, source: 'cache' as const }
    }

    return {
      followers: FALLBACK_FOLLOWERS,
      source: 'fallback' as const
    }
  }
})
