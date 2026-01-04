export interface DevToUser {
  id: number
  username: string
  name: string
  summary: string | null
  twitter_username: string | null
  github_username: string | null
  profile_image: string
}

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
      // Fetch articles and follower count in parallel
      const [articlesResponse, followersResponse] = await Promise.all([
        $fetch<DevToArticle[]>(
          `https://dev.to/api/articles?username=${username}&per_page=${perPage}`
        ),
        $fetch<{ followers_count?: number }>(`https://dev.to/api/followers/users?username=${username}&per_page=1000`).catch(() => null)
      ])
      
      articles.value = articlesResponse
      
      // Try to get follower count from the response length (followers endpoint returns array)
      if (Array.isArray(followersResponse)) {
        followers.value = followersResponse.length
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
