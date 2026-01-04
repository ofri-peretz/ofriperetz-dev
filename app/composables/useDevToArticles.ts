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
  const followers = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchArticles = async (username: string = 'ofri-peretz', perPage: number = 10) => {
    loading.value = true
    error.value = null

    try {
      // Fetch articles (public API) and followers (via server route for security)
      const [articlesResponse, statsResponse] = await Promise.all([
        $fetch<DevToArticle[]>(
          `https://dev.to/api/articles?username=${username}&per_page=${perPage}`
        ),
        $fetch<{ followers: number }>('/api/devto-stats')
      ])
      
      articles.value = articlesResponse
      followers.value = statsResponse.followers
    } catch (e) {
      error.value = 'Failed to fetch articles from dev.to'
      console.error('dev.to API error:', e)
      // Set fallback followers on error
      followers.value = 45
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
