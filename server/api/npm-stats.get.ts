import { getCache, setCache, CACHE_TTL, getTodayDate, getYesterdayDate } from '../utils/cache'

// Fallback data when API fails
const FALLBACK_STATS = {
  packages: [
    { name: 'eslint-plugin-secure-coding', downloads: 1900 },
    { name: 'eslint-plugin-vercel-ai-security', downloads: 983 },
    { name: '@interlace/eslint-devkit', downloads: 833 },
    { name: 'eslint-plugin-pg', downloads: 817 },
    { name: 'eslint-plugin-browser-security', downloads: 576 },
    { name: 'eslint-plugin-express-security', downloads: 571 },
    { name: 'eslint-plugin-lambda-security', downloads: 570 },
    { name: 'eslint-plugin-crypto', downloads: 565 }
  ],
  totalDownloads: 9500,
  packageCount: 16
}

// Packages to exclude from stats (experimental/deprecated)
const EXCLUDED_PACKAGES = [
  'eslint-plugin-mcp',
  'eslint-plugin-llm-optimized',
  'eslint-plugin-llm',
  'eslint-plugin-mcp-optimized'
]
// Also exclude any @forge-js/* packages (prefix match)
const EXCLUDED_PREFIXES = ['@forge-js/']

const isExcluded = (pkgName: string) => {
  if (EXCLUDED_PACKAGES.includes(pkgName)) return true
  if (EXCLUDED_PREFIXES.some(prefix => pkgName.startsWith(prefix))) return true
  return false
}

interface PackageDownloads {
  name: string
  downloads: number
  dailyData: Array<{ downloads: number, day: string }>
}

/**
 * Fetch download stats for a single package within a date range
 * Uses tiered caching: historical data cached for 24h, fresh data for 1 min
 */
async function fetchPackageDownloads(
  pkg: string,
  startDate: string,
  endDate: string,
  isHistorical: boolean
): Promise<{ downloads: number, dailyData: Array<{ downloads: number, day: string }> }> {
  const cacheKey = `npm:${pkg}:${startDate}:${endDate}`

  // Check cache first
  const cached = getCache<{ downloads: number, dailyData: Array<{ downloads: number, day: string }> }>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await $fetch<{
      downloads: Array<{ downloads: number, day: string }>
    }>(`https://api.npmjs.org/downloads/range/${startDate}:${endDate}/${encodeURIComponent(pkg)}`, {
      timeout: 5000
    })

    const downloads = response.downloads?.reduce((sum, d) => sum + d.downloads, 0) || 0
    const result = {
      downloads,
      dailyData: response.downloads || []
    }

    // Cache with appropriate TTL based on whether data is historical
    const ttl = isHistorical ? CACHE_TTL.HISTORICAL : CACHE_TTL.FRESH
    setCache(cacheKey, result, ttl)

    return result
  } catch (e) {
    console.warn(`Failed to fetch downloads for ${pkg} (${startDate} to ${endDate}):`, e)
    return { downloads: 0, dailyData: [] }
  }
}

export default defineEventHandler(async () => {
  const username = 'ofriperetz'

  // Check if we have a complete cached response (for short-term optimization)
  const fullCacheKey = 'npm:full-response'
  const cachedResponse = getCache<typeof FALLBACK_STATS>(fullCacheKey)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    // Fetch all packages from npm registry for this user
    const packagesCacheKey = 'npm:packages-list'
    let packages = getCache<string[]>(packagesCacheKey)

    if (!packages) {
      const searchResponse = await $fetch<{
        objects: Array<{
          package: {
            name: string
            description: string
            version: string
            date: string
          }
        }>
      }>(`https://registry.npmjs.org/-/v1/search?text=maintainer:${username}&size=100`, {
        timeout: 10000
      })

      // Filter out excluded packages
      const allPackages = searchResponse.objects?.map(obj => obj.package.name) || []
      packages = allPackages.filter(pkg => !isExcluded(pkg))

      // Cache package list for 5 minutes (packages don't change often)
      setCache(packagesCacheKey, packages, CACHE_TTL.STANDARD)
    }

    if (packages.length === 0) {
      console.warn('No packages found, returning fallback')
      return FALLBACK_STATS
    }

    // Calculate date ranges
    const today = getTodayDate()
    const yesterday = getYesterdayDate()

    // Historical range: 1 year ago to yesterday (cached for 24h)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const historicalStart = oneYearAgo.toISOString().split('T')[0]

    // Fetch download stats for each package using tiered caching
    const downloadStats: PackageDownloads[] = await Promise.all(
      packages.map(async (pkg) => {
        // Fetch historical data (cached for 24h)
        const historical = await fetchPackageDownloads(pkg, historicalStart, yesterday, true)

        // Fetch today's data (cached for 1 min)
        const fresh = await fetchPackageDownloads(pkg, today, today, false)

        // Merge daily data
        const allDailyData = [...historical.dailyData, ...fresh.dailyData]

        return {
          name: pkg,
          downloads: historical.downloads + fresh.downloads,
          dailyData: allDailyData
        }
      })
    )

    // Sort by downloads and calculate total
    const sortedStats = downloadStats.sort((a, b) => b.downloads - a.downloads)
    const totalDownloads = sortedStats.reduce((sum, pkg) => sum + pkg.downloads, 0)

    const result = {
      packages: sortedStats,
      totalDownloads,
      packageCount: packages.length
    }

    // If total is 0, return fallback instead (API likely failed)
    if (totalDownloads === 0) {
      console.warn('All packages returned 0 downloads, using fallback')
      return FALLBACK_STATS
    }

    // Cache full response for 1 minute (quick optimization for same-page requests)
    setCache(fullCacheKey, result, CACHE_TTL.FRESH)

    return result
  } catch (error) {
    console.error('Failed to fetch npm stats:', error)
    return FALLBACK_STATS
  }
})
