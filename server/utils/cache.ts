/**
 * Tiered Caching Utility
 *
 * Strategy:
 * - HISTORICAL: Long TTL (24h) for data that rarely changes (past dates)
 * - FRESH: Short TTL (1 min) for live/current data
 * - STANDARD: Medium TTL (5 min) for general API responses
 */

interface CacheEntry<T> {
  data: T
  expires: number
  createdAt: number
}

// In-memory cache store
const cache = new Map<string, CacheEntry<any>>()

// TTL constants
export const CACHE_TTL = {
  FRESH: 60 * 1000, // 1 minute - for today's data
  STANDARD: 5 * 60 * 1000, // 5 minutes - general API cache
  HISTORICAL: 24 * 60 * 60 * 1000 // 24 hours - for past/immutable data
} as const

/**
 * Get cached data if still valid
 */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

/**
 * Set cache with specified TTL
 */
export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs,
    createdAt: Date.now()
  })
}

/**
 * Check if a date string is "historical" (before today)
 */
export function isHistoricalDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Get the cache key for a date range
 */
export function getDateRangeKey(prefix: string, startDate: string, endDate: string): string {
  return `${prefix}:${startDate}:${endDate}`
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

/**
 * Clear all cache entries (useful for testing/debugging)
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): { size: number, keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  }
}
