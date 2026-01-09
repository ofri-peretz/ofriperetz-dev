import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

interface Snapshot {
  date: string
  npm: { totalDownloads: number, packageCount: number }
  github: {
    stars: number
    followers: number
    contributions?: number
    commits?: number
  }
  devto: {
    views: number
    followers: number
    reactions: number
    comments: number
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

  try {
    const files = await readdir(snapshotsDir)
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort()

    if (jsonFiles.length === 0) {
      // No snapshot files yet - return empty array
      // The UI will show "No historical data yet" message
      cachedHistory.data = []
      cachedHistory.lastFetched = Date.now()
      return []
    }

    const snapshots: Snapshot[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await readFile(join(snapshotsDir, file), 'utf-8')
        return JSON.parse(content) as Snapshot
      })
    )

    // Sort by date ascending
    snapshots.sort((a, b) => a.date.localeCompare(b.date))

    // Only return the last 365 days (keep all data in storage, limit for display)
    const MAX_DAYS = 365
    const filteredSnapshots = snapshots.slice(-MAX_DAYS)

    cachedHistory.data = filteredSnapshots
    cachedHistory.lastFetched = Date.now()

    return filteredSnapshots
  } catch (error) {
    console.error('[metrics-history] Failed to read snapshots:', error)

    // Return cached data if available
    if (cachedHistory.data) {
      return cachedHistory.data
    }

    // No snapshots directory or error - return empty array
    // Snapshots will be captured by GitHub Actions daily
    return []
  }
})
