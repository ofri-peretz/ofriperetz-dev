#!/usr/bin/env node
/**
 * Capture a metrics snapshot to .data/snapshots/
 * This fetches live data from the APIs and saves it as a JSON file
 *
 * Usage: node scripts/capture-snapshot.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function fetchJSON(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`)
    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint}: ${response.status}`)
      return null
    }
    return await response.json()
  } catch (e) {
    console.error(`Error fetching ${endpoint}:`, e.message)
    return null
  }
}

async function captureSnapshot() {
  console.log('📸 Capturing metrics snapshot...\n')

  // Fetch all data in parallel
  const [homepageStats, devtoArticles, npmStats] = await Promise.all([
    fetchJSON('/api/homepage-stats'),
    fetchJSON('/api/devto-articles'),
    fetchJSON('/api/npm-stats')
  ])

  if (!homepageStats) {
    console.error('❌ Failed to fetch homepage stats. Is the dev server running?')
    process.exit(1)
  }

  const today = new Date().toISOString().split('T')[0]

  // Calculate devto stats from articles
  const articles = devtoArticles?.articles || []
  const devtoViews = articles.reduce((sum, a) => sum + (a.page_views_count || 0), 0)
  const devtoReactions = articles.reduce((sum, a) => sum + (a.positive_reactions_count || 0), 0)
  const devtoComments = articles.reduce((sum, a) => sum + (a.comments_count || 0), 0)

  const snapshot = {
    date: today,
    npm: {
      totalDownloads: homepageStats.npm?.totalDownloads || 0,
      packageCount: homepageStats.npm?.packageCount || 0
    },
    github: {
      stars: homepageStats.github?.totalStars || 0,
      followers: homepageStats.github?.followers || 0,
      contributions: homepageStats.github?.totalContributions || 0,
      commits: homepageStats.github?.recentCommits || 0
    },
    devto: {
      views: devtoViews || homepageStats.devto?.totalViews || 0,
      followers: homepageStats.devto?.followers || 0,
      reactions: devtoReactions,
      comments: devtoComments,
      articles: articles.length || homepageStats.devto?.articleCount || 0
    },
    ecosystem: {
      packages: npmStats?.length || homepageStats.npm?.packageCount || 0,
      plugins: 11,
      rules: 216,
      owaspCoverage: 100,
      testCoverage: 90
    }
  }

  // Ensure snapshots directory exists
  const snapshotsDir = join(projectRoot, '.data', 'snapshots')
  await mkdir(snapshotsDir, { recursive: true })

  // Write snapshot
  const filename = `${today}.json`
  const filepath = join(snapshotsDir, filename)
  await writeFile(filepath, JSON.stringify(snapshot, null, 2))

  console.log('✅ Snapshot captured!\n')
  console.log(`📁 Saved to: .data/snapshots/${filename}\n`)
  console.log('📊 Data:')
  console.log(`   GitHub Stars: ${snapshot.github.stars}`)
  console.log(`   GitHub Followers: ${snapshot.github.followers}`)
  console.log(`   GitHub Contributions: ${snapshot.github.contributions}`)
  console.log(`   NPM Downloads: ${snapshot.npm.totalDownloads}`)
  console.log(`   NPM Packages: ${snapshot.npm.packageCount}`)
  console.log(`   Dev.to Views: ${snapshot.devto.views}`)
  console.log(`   Dev.to Followers: ${snapshot.devto.followers}`)
  console.log(`   Dev.to Articles: ${snapshot.devto.articles}`)
  console.log(`   Dev.to Reactions: ${snapshot.devto.reactions}`)
  console.log(`   Dev.to Comments: ${snapshot.devto.comments}`)
}

captureSnapshot()
