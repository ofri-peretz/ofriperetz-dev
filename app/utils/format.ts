/**
 * Global metric formatting standard
 * - < 100,000 (6 digits): Full number with separators (e.g. 99,999)
 * - 100,000 to 99,999,999: K (e.g. 100.2K)
 * - >= 100,000,000 (9 digits): M (e.g. 100.5M)
 *
 * @param num The number to format
 * @param decimals Whether to allow decimal places (usually for ratios)
 */
export const formatMetric = (num: number | string, decimals: number = 0) => {
  if (typeof num === 'string') return num
  const val = Math.abs(num)

  if (val < 100000) {
    // For full numbers, use specified decimals (0 for metrics, >0 for ratios)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  } else if (val < 100000000) {
    // 6-8 digits: K format. Drop decimals unless explicitly asked for via 'decimals' param
    const kVal = num / 1000
    return kVal.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + 'K'
  } else {
    // 9+ digits: M format. Drop decimals unless explicitly asked for
    const mVal = num / 1000000
    return mVal.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + 'M'
  }
}
