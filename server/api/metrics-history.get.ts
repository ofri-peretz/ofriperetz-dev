import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

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

// Cache to avoid frequent filesystem reads
const cachedHistory = {
  lastFetched: 0,
  data: null as Snapshot[] | null
}

export default defineEventHandler(async () => {
  // In dev mode, skip cache entirely to always read fresh files
  // In production, cache for 1 hour
  const CACHE_TTL = process.dev ? 0 : 60 * 60 * 1000

  const useCache = !process.dev 
    && cachedHistory.data 
    && cachedHistory.data.length > 0 
    && (Date.now() - cachedHistory.lastFetched) < CACHE_TTL
  
  if (useCache) {
    return cachedHistory.data
  }

  const snapshotsDir = join(process.cwd(), '.data', 'snapshots')
  const aggregationFile = join(snapshotsDir, 'aggregation.json')

  try {
    // Read the single aggregation file for performance (1 file vs N files)
    const content = await readFile(aggregationFile, 'utf-8')
    const snapshots: Snapshot[] = JSON.parse(content)

    // Snapshots are already sorted and limited to 365 days by the workflow
    cachedHistory.data = snapshots
    cachedHistory.lastFetched = Date.now()

    return snapshots
  } catch {
    // Aggregation file doesn't exist yet - return empty array
    // The UI will show "No historical data yet" message
    // Once GitHub Actions runs, it will create the aggregation file
    console.log('[metrics-history] No aggregation.json found, returning empty array')
    
    cachedHistory.data = []
    cachedHistory.lastFetched = Date.now()
    return []
  }
})
