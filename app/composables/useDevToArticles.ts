export interface DevToArticle {
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
  const totalViews = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchArticles = async (username: string = 'ofri-peretz', perPage: number = 10) => {
    loading.value = true
    error.value = null

    try {
      // Fetch articles from public API (no auth needed)
      const articlesResponse = await $fetch<DevToArticle[]>(
        `https://dev.to/api/articles?username=${username}&per_page=${perPage}`
      )
      articles.value = articlesResponse || []
    } catch (e) {
      error.value = 'Failed to fetch articles from dev.to'
      console.error('dev.to articles API error:', e)
      articles.value = []
    }

    // Fetch private stats (followers + views)
    try {
      const statsResponse = await $fetch<{ followers: number, totalViews: number }>('/api/devto-stats')
      followers.value = statsResponse?.followers || 45
      totalViews.value = statsResponse?.totalViews || 0
    } catch (e) {
      console.error('dev.to stats API error:', e)
      followers.value = 45 // Fallback
      totalViews.value = 0
    }

    loading.value = false
  }

  return {
    articles,
    followers,
    totalViews,
    loading,
    error,
    fetchArticles
  }
}
