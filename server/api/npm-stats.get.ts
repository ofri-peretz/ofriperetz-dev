export default defineEventHandler(async () => {
  const username = 'ofriperetz'
  
  try {
    // Fetch all packages from npm registry for this user
    // npm doesn't have a direct "user packages" API, so we use the search API
    const searchResponse = await $fetch<{
      objects: Array<{
        package: {
          name: string
          description: string
          version: string
          date: string
        }
      }>
    }>(`https://registry.npmjs.org/-/v1/search?text=maintainer:${username}&size=100`)
    
    const packages = searchResponse.objects.map(obj => obj.package.name)
    
    // Fetch download stats for each package
    const downloadStats = await Promise.all(
      packages.map(async (pkg) => {
        try {
          const response = await $fetch<{
            downloads: Array<{ downloads: number; day: string }>
          }>(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(pkg)}`)
          
          const totalDownloads = response.downloads.reduce((sum, d) => sum + d.downloads, 0)
          return {
            name: pkg,
            downloads: totalDownloads,
            dailyData: response.downloads
          }
        } catch {
          return { name: pkg, downloads: 0, dailyData: [] }
        }
      })
    )
    
    // Sort by downloads and calculate total
    const sortedStats = downloadStats.sort((a, b) => b.downloads - a.downloads)
    const totalDownloads = sortedStats.reduce((sum, pkg) => sum + pkg.downloads, 0)
    
    return {
      packages: sortedStats,
      totalDownloads,
      packageCount: packages.length
    }
  } catch (error) {
    console.error('Failed to fetch npm stats:', error)
    return {
      packages: [],
      totalDownloads: 0,
      packageCount: 0,
      error: 'Failed to fetch'
    }
  }
})
