export interface NpmDownloadDay {
  downloads: number
  day: string
}

export interface NpmRangeStats {
  start: string
  end: string
  package: string
  downloads: NpmDownloadDay[]
}

export interface PackageStats {
  name: string
  downloads: number
  dailyData?: NpmDownloadDay[]
}

export const useNpmStats = () => {
  const stats = ref<PackageStats[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const totalDownloads = computed(() => 
    stats.value.reduce((sum, pkg) => sum + pkg.downloads, 0)
  )

  const packages = [
    'eslint-plugin-secure-coding',
    'eslint-plugin-browser-security',
    'eslint-plugin-crypto',
    'eslint-plugin-jwt',
    'eslint-plugin-import-next',
    'eslint-plugin-nestjs-security',
    'eslint-plugin-express-security',
    'eslint-plugin-lambda-security',
    'eslint-plugin-vercel-ai-security',
    'eslint-plugin-pg',
    'eslint-plugin-mongodb-security',
    'eslint-plugin-architecture',
    'eslint-plugin-quality',
    'eslint-plugin-react-a11y',
    'eslint-plugin-react-features',
  ]

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    const results: PackageStats[] = []

    try {
      // Fetch each package's range data for the chart
      await Promise.all(packages.map(async (pkg) => {
        try {
          const response = await $fetch<NpmRangeStats>(
            `https://api.npmjs.org/downloads/range/last-month/${pkg}`
          )
          const totalDownloads = response.downloads.reduce((sum, d) => sum + d.downloads, 0)
          results.push({
            name: pkg,
            downloads: totalDownloads,
            dailyData: response.downloads
          })
        } catch {
          // Package might not exist yet
          results.push({ name: pkg, downloads: 0 })
        }
      }))
      
      // Sort by downloads
      stats.value = results.sort((a, b) => b.downloads - a.downloads)
    } catch (e) {
      error.value = 'Failed to fetch npm stats'
      console.error('npm stats error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    totalDownloads,
    packages,
    fetchStats
  }
}
