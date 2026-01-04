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
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchArticles = async (username: string = 'ofri-peretz', perPage: number = 10) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<DevToArticle[]>(
        `https://dev.to/api/articles?username=${username}&per_page=${perPage}`
      )
      articles.value = response
    } catch (e) {
      error.value = 'Failed to fetch articles from dev.to'
      console.error('dev.to API error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    loading,
    error,
    fetchArticles
  }
}
