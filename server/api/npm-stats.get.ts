// Cache npm stats to avoid rate limiting
const cachedStats = {
  lastFetched: 0,
  data: null as null | { packages: any[]; totalDownloads: number; packageCount: number }
}

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
    { name: 'eslint-plugin-crypto', downloads: 565 },
  ],
  totalDownloads: 9500,
  packageCount: 16
}

export default defineEventHandler(async () => {
  const username = 'ofriperetz'
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache
  
  // Return cached data if fresh
  if (cachedStats.data && (Date.now() - cachedStats.lastFetched) < CACHE_TTL) {
    return cachedStats.data
  }
  
  try {
    // Fetch all packages from npm registry for this user
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
      timeout: 10000 // 10 second timeout
    })
    
    const packages = searchResponse.objects?.map(obj => obj.package.name) || []
    
    if (packages.length === 0) {
      console.warn('No packages found, returning fallback')
      return FALLBACK_STATS
    }
    
    // Fetch download stats for each package (with timeout and error handling per package)
    const downloadStats = await Promise.all(
      packages.map(async (pkg) => {
        try {
          const response = await $fetch<{
            downloads: Array<{ downloads: number; day: string }>
          }>(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(pkg)}`, {
            timeout: 5000
          })
          
          const totalDownloads = response.downloads?.reduce((sum, d) => sum + d.downloads, 0) || 0
          return {
            name: pkg,
            downloads: totalDownloads,
            dailyData: response.downloads || []
          }
        } catch (e) {
          console.warn(`Failed to fetch downloads for ${pkg}:`, e)
          return { name: pkg, downloads: 0, dailyData: [] }
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
    
    // Cache the result if we got meaningful data
    if (totalDownloads > 0) {
      cachedStats.data = result
      cachedStats.lastFetched = Date.now()
    }
    
    // If total is 0, return fallback instead (API likely failed)
    if (totalDownloads === 0) {
      console.warn('All packages returned 0 downloads, using fallback')
      return FALLBACK_STATS
    }
    
    return result
  } catch (error) {
    console.error('Failed to fetch npm stats:', error)
    
    // Return cached data if available, otherwise fallback
    if (cachedStats.data) {
      return cachedStats.data
    }
    
    return FALLBACK_STATS
  }
})
