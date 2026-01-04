export interface DevToArticle {
  id: number
  title: string
  description: string
  url: string
  cover_image: string | null
  social_image: string
  published_at: string
  reading_time_minutes: number
  positive_reactions_count: number
  comments_count: number
  tag_list: string[]
  user: {
    name: string
    username: string
    profile_image: string
  }
}

export const useDevToArticles = () => {
  const articles = ref<DevToArticle[]>([])
  // dev.to followers API requires authentication, so we'll use runtime config
  // or fall back to a manually set value that can be updated periodically
  const followers = ref(45) // Updated: Jan 4, 2026 - from dev.to dashboard
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchArticles = async (username: string = 'ofri-peretz', perPage: number = 10) => {
    loading.value = true
    error.value = null

    try {
      const articlesResponse = await $fetch<DevToArticle[]>(
        `https://dev.to/api/articles?username=${username}&per_page=${perPage}`
      )
      
      articles.value = articlesResponse
      
      // Note: dev.to follower count requires API key authentication
      // The followers value is set manually from the dashboard
      // To enable dynamic fetching, add DEVTO_API_KEY to runtime config
      const config = useRuntimeConfig()
      if (config.public.devtoApiKey) {
        try {
          const response = await $fetch<{ followers_count: number }>(
            `https://dev.to/api/users/me`,
            {
              headers: {
                'api-key': config.public.devtoApiKey as string
              }
            }
          )
          if (response?.followers_count) {
            followers.value = response.followers_count
          }
        } catch {
          // Silently fail - use default value
        }
      }
    } catch (e) {
      error.value = 'Failed to fetch articles from dev.to'
      console.error('dev.to API error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    followers,
    loading,
    error,
    fetchArticles
  }
}
