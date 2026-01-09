/**
 * Dev.to Articles Composable
 *
 * PERFORMANCE: Uses combined /api/devto-combined endpoint instead of making
 * separate calls to /api/devto-articles and /api/devto-stats
 */

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
  page_views_count?: number
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

export const useDevToArticles = () => {
  const articles = ref<DevToArticle[]>([])
  const followers = ref(0)
  const totalViews = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchArticles = async (_username: string = 'ofri-peretz', _perPage: number = 10) => {
    loading.value = true
    error.value = null

    try {
      // Use combined endpoint for single API call
      const response = await $fetch<CombinedResponse>('/api/devto-combined')

      articles.value = response?.articles || []
      followers.value = response?.stats?.followers || 45
      totalViews.value = response?.stats?.totalViews || 0
    } catch (e) {
      error.value = 'Failed to fetch articles from dev.to'
      console.error('dev.to combined API error:', e)
      articles.value = []
      followers.value = 45 // Fallback
      totalViews.value = 0
    } finally {
      loading.value = false
    }
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
