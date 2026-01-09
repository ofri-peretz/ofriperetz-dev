interface Snapshot {
  date: string
  npm: { 
    totalDownloads: number
    dailyDownloads?: number
    packageCount: number 
  }
  github: {
    stars: number
    followers: number
    contributions?: number
    dailyContributions?: number
    commits?: number
    dailyCommits?: number
  }
  devto: {
    views: number
    dailyViews?: number
    followers: number
    dailyFollowers?: number
    reactions: number
    dailyReactions?: number
    comments: number
    dailyComments?: number
    articles?: number
  }
  ecosystem?: {
    packages: number
    plugins: number
    rules: number
    owaspCoverage: number
    testCoverage: number
  }
}

// Cache to avoid frequent API calls
const cachedHistory = {
  lastFetched: 0,
  data: null as Snapshot[] | null
}

// GitHub raw content URL for the aggregation file
const AGGREGATION_URL = 'https://raw.githubusercontent.com/ofri-peretz/ofriperetz-dev/main/.data/snapshots/aggregation.json'

export default defineEventHandler(async () => {
  // Cache for 1 hour in production, 1 minute in dev
  const CACHE_TTL = process.dev ? 60 * 1000 : 60 * 60 * 1000

  const useCache = cachedHistory.data 
    && cachedHistory.data.length > 0 
    && (Date.now() - cachedHistory.lastFetched) < CACHE_TTL
  
  if (useCache) {
    return cachedHistory.data
  }

  try {
    // Fetch aggregation.json directly from GitHub
    const response = await fetch(AGGREGATION_URL, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`)
    }

    const snapshots: Snapshot[] = await response.json()

    // Cache the result
    cachedHistory.data = snapshots
    cachedHistory.lastFetched = Date.now()

    return snapshots
  } catch (error) {
    console.error('[metrics-history] Failed to fetch from GitHub:', error)

    // Return cached data if available
    if (cachedHistory.data) {
      return cachedHistory.data
    }

    // No data yet - return empty array
    // The UI will show "No historical data yet" message
    return []
  }
})
