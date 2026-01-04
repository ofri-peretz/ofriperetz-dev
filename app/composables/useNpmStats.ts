export interface NpmStats {
  package: string
  downloads: number
  start: string
  end: string
}

export const useNpmStats = () => {
  const stats = ref<Record<string, NpmStats>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalDownloads = computed(() => 
    Object.values(stats.value).reduce((sum, pkg) => sum + (pkg?.downloads || 0), 0)
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
    '@AriTedesworker/eslint-devkit'
  ]

  const fetchStats = async () => {
    loading.value = true
    error.value = null

    try {
      const packageList = packages.join(',')
      const response = await $fetch<Record<string, NpmStats>>(
        `https://api.npmjs.org/downloads/point/last-month/${packageList}`
      )
      stats.value = response
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
