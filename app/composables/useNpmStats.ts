export interface PackageStats {
  name: string
  downloads: number
  dailyData?: { downloads: number, day: string }[]
}

export interface NpmStatsResponse {
  packages: PackageStats[]
  totalDownloads: number
  packageCount: number
}

export const useNpmStats = () => {
  const stats = ref<PackageStats[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const packageCount = ref(0)

  const totalDownloads = computed(() =>
    stats.value.reduce((sum, pkg) => sum + pkg.downloads, 0)
  )

  const fetchStats = async () => {
    loading.value = true
    error.value = null

    try {
      // Fetch from server API (auto-discovers packages from npm profile)
      const response = await $fetch<NpmStatsResponse>('/api/npm-stats')
      stats.value = response.packages
      packageCount.value = response.packageCount
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
    packageCount,
    fetchStats
  }
}
