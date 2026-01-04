export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // If no API key configured, return fallback values
  if (!config.devtoApiKey) {
    return {
      followers: 45, // Fallback: manually updated from dashboard
      source: 'fallback'
    }
  }

  try {
    // Fetch user info from dev.to API (requires authentication)
    const userInfo = await $fetch('https://dev.to/api/users/me', {
      headers: {
        'api-key': config.devtoApiKey
      }
    }) as { followers_count?: number }

    return {
      followers: userInfo.followers_count || 45,
      source: 'api'
    }
  } catch (error) {
    console.error('Failed to fetch dev.to stats:', error)
    return {
      followers: 45, // Fallback on error
      source: 'fallback'
    }
  }
})
