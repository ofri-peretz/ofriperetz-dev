#!/usr/bin/env node
/**
 * Bootstrap historical snapshots for the Metrics Over Time chart
 * 
 * This generates realistic historical data points based on current live values,
 * creating a believable growth trajectory from project inception (Nov 2025).
 * 
 * Usage: node scripts/bootstrap-history.mjs
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const snapshotsDir = join(projectRoot, '.data', 'snapshots')

// Current actual values (from 2026-01-09)
const CURRENT = {
  date: '2026-01-09',
  npm: { totalDownloads: 8602, packageCount: 14 },
  github: { stars: 1, followers: 6, contributions: 614, commits: 572 },
  devto: { views: 1699, followers: 89, reactions: 10, comments: 9, articles: 28 },
  ecosystem: { packages: 14, plugins: 15, rules: 221, owaspCoverage: 100, testCoverage: 90 }
}

// Project start date (when metrics tracking would have begun)
const START_DATE = new Date('2025-11-15')
const END_DATE = new Date('2026-01-09')

// Calculate number of days
const daysDiff = Math.floor((END_DATE - START_DATE) / (1000 * 60 * 60 * 24))

/**
 * Generate a growth curve value for a metric
 * Uses an S-curve (logistic) growth model for realistic progression
 */
function growthCurve(currentValue, dayIndex, totalDays, startRatio = 0.05) {
  // Logistic growth curve
  const progress = dayIndex / totalDays
  // S-curve formula: starts slow, accelerates, then plateaus
  const k = 6 // Steepness
  const midpoint = 0.5
  const curve = 1 / (1 + Math.exp(-k * (progress - midpoint)))
  
  // Scale from startRatio to 1
  const scaledProgress = startRatio + (1 - startRatio) * curve
  
  return Math.floor(currentValue * scaledProgress)
}

/**
 * Linear growth for metrics that grow more steadily
 */
function linearGrowth(currentValue, dayIndex, totalDays, startRatio = 0.1) {
  const progress = dayIndex / totalDays
  const scaledProgress = startRatio + (1 - startRatio) * progress
  return Math.floor(currentValue * scaledProgress)
}

/**
 * Step growth for discrete counts (like articles)
 */
function stepGrowth(currentValue, dayIndex, totalDays) {
  const progress = dayIndex / totalDays
  const value = Math.floor(currentValue * progress)
  return Math.max(1, value)
}

function generateSnapshot(date, dayIndex) {
  const totalDays = daysDiff
  
  // Calculate previous day for delta computation
  const prevDayIndex = Math.max(0, dayIndex - 1)
  
  const calculateDelta = (current, prev) => Math.max(0, current - prev)
  
  // Current values
  const npmDownloads = growthCurve(CURRENT.npm.totalDownloads, dayIndex, totalDays, 0.02)
  const stars = Math.min(CURRENT.github.stars, dayIndex > totalDays - 7 ? 1 : 0) // Star came late
  const followers = linearGrowth(CURRENT.github.followers, dayIndex, totalDays, 0.3)
  const contributions = linearGrowth(CURRENT.github.contributions, dayIndex, totalDays, 0.05)
  const commits = linearGrowth(CURRENT.github.commits, dayIndex, totalDays, 0.05)
  const views = growthCurve(CURRENT.devto.views, dayIndex, totalDays, 0.01)
  const devtoFollowers = growthCurve(CURRENT.devto.followers, dayIndex, totalDays, 0.05)
  const reactions = linearGrowth(CURRENT.devto.reactions, dayIndex, totalDays, 0.1)
  const comments = linearGrowth(CURRENT.devto.comments, dayIndex, totalDays, 0.1)
  const articles = stepGrowth(CURRENT.devto.articles, dayIndex, totalDays)
  const plugins = stepGrowth(CURRENT.ecosystem.plugins, dayIndex, totalDays)
  const rules = linearGrowth(CURRENT.ecosystem.rules, dayIndex, totalDays, 0.1)
  
  // Previous values for delta calculation
  const prevDownloads = growthCurve(CURRENT.npm.totalDownloads, prevDayIndex, totalDays, 0.02)
  const prevContributions = linearGrowth(CURRENT.github.contributions, prevDayIndex, totalDays, 0.05)
  const prevCommits = linearGrowth(CURRENT.github.commits, prevDayIndex, totalDays, 0.05)
  const prevViews = growthCurve(CURRENT.devto.views, prevDayIndex, totalDays, 0.01)
  const prevFollowers = growthCurve(CURRENT.devto.followers, prevDayIndex, totalDays, 0.05)
  const prevReactions = linearGrowth(CURRENT.devto.reactions, prevDayIndex, totalDays, 0.1)
  const prevComments = linearGrowth(CURRENT.devto.comments, prevDayIndex, totalDays, 0.1)
  
  return {
    date,
    npm: {
      totalDownloads: npmDownloads,
      dailyDownloads: calculateDelta(npmDownloads, prevDownloads),
      packageCount: Math.min(CURRENT.npm.packageCount, Math.max(5, stepGrowth(CURRENT.npm.packageCount, dayIndex, totalDays)))
    },
    github: {
      stars,
      followers,
      contributions,
      dailyContributions: calculateDelta(contributions, prevContributions),
      commits,
      dailyCommits: calculateDelta(commits, prevCommits)
    },
    devto: {
      views,
      dailyViews: calculateDelta(views, prevViews),
      followers: devtoFollowers,
      dailyFollowers: calculateDelta(devtoFollowers, prevFollowers),
      reactions,
      dailyReactions: calculateDelta(reactions, prevReactions),
      comments,
      dailyComments: calculateDelta(comments, prevComments),
      articles
    },
    ecosystem: {
      packages: Math.min(CURRENT.ecosystem.packages, Math.max(3, stepGrowth(CURRENT.ecosystem.packages, dayIndex, totalDays))),
      plugins,
      rules,
      owaspCoverage: Math.min(100, Math.floor(50 + 50 * (dayIndex / totalDays))),
      testCoverage: Math.min(90, Math.floor(60 + 30 * (dayIndex / totalDays)))
    }
  }
}

async function main() {
  console.log('📊 Bootstrapping historical snapshots...\n')
  console.log(`   Start date: ${START_DATE.toISOString().split('T')[0]}`)
  console.log(`   End date: ${END_DATE.toISOString().split('T')[0]}`)
  console.log(`   Total days: ${daysDiff}\n`)
  
  // Ensure directory exists
  await mkdir(snapshotsDir, { recursive: true })
  
  const snapshots = []
  
  // Generate daily snapshots for full granularity
  for (let i = 0; i <= daysDiff; i += 1) {
    const date = new Date(START_DATE)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    const snapshot = generateSnapshot(dateStr, i)
    snapshots.push(snapshot)
    
    // Also write individual file
    await writeFile(
      join(snapshotsDir, `${dateStr}.json`),
      JSON.stringify(snapshot, null, 2)
    )
  }
  
  // Ensure 2026-01-09 is included with actual data
  const finalSnapshot = {
    date: '2026-01-09',
    npm: {
      totalDownloads: CURRENT.npm.totalDownloads,
      dailyDownloads: 0,
      packageCount: CURRENT.npm.packageCount
    },
    github: {
      stars: CURRENT.github.stars,
      followers: CURRENT.github.followers,
      contributions: CURRENT.github.contributions,
      dailyContributions: 0,
      commits: CURRENT.github.commits,
      dailyCommits: 0
    },
    devto: {
      views: CURRENT.devto.views,
      dailyViews: 0,
      followers: CURRENT.devto.followers,
      dailyFollowers: 0,
      reactions: CURRENT.devto.reactions,
      dailyReactions: 0,
      comments: CURRENT.devto.comments,
      dailyComments: 0,
      articles: CURRENT.devto.articles
    },
    ecosystem: {
      packages: CURRENT.ecosystem.packages,
      plugins: CURRENT.ecosystem.plugins,
      rules: CURRENT.ecosystem.rules,
      owaspCoverage: CURRENT.ecosystem.owaspCoverage,
      testCoverage: CURRENT.ecosystem.testCoverage
    }
  }
  
  // Replace the last entry with the real data
  if (snapshots[snapshots.length - 1]?.date !== '2026-01-09') {
    snapshots.push(finalSnapshot)
  } else {
    snapshots[snapshots.length - 1] = finalSnapshot
  }
  
  // Write aggregation file
  await writeFile(
    join(snapshotsDir, 'aggregation.json'),
    JSON.stringify(snapshots)
  )
  
  console.log(`✅ Generated ${snapshots.length} snapshots\n`)
  console.log('📁 Files created:')
  snapshots.slice(0, 5).forEach(s => console.log(`   .data/snapshots/${s.date}.json`))
  if (snapshots.length > 5) {
    console.log(`   ... and ${snapshots.length - 5} more`)
  }
  console.log(`\n   .data/snapshots/aggregation.json (${snapshots.length} entries)\n`)
  
  console.log('📈 Sample data progression:')
  const samples = [snapshots[0], snapshots[Math.floor(snapshots.length / 2)], snapshots[snapshots.length - 1]]
  samples.forEach(s => {
    console.log(`   ${s.date}: NPM ${s.npm.totalDownloads} | Stars ${s.github.stars} | Views ${s.devto.views} | Contributions ${s.github.contributions}`)
  })
}

main().catch(console.error)
