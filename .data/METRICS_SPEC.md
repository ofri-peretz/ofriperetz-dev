# Metrics Snapshot System

This document explains how the daily metrics snapshot system works for tracking portfolio growth over time.

## Overview

The system captures daily snapshots of all key metrics from various sources (npm, GitHub, Dev.to) and stores them for historical analysis. Each snapshot contains both **cumulative totals** and **daily deltas**.

## Architecture

```
GitHub Actions (daily at 6 AM UTC)
         ↓
  Fetches data from APIs (npm, GitHub, Dev.to)
         ↓
  Calculates daily deltas from previous day
         ↓
  Saves: .data/snapshots/YYYY-MM-DD.json (individual backup)
  Saves: .data/snapshots/aggregation.json (all snapshots combined)
         ↓
  Git commits & pushes to repository
         ↓
  Server fetches aggregation.json from GitHub raw content
         ↓
  Chart displays metrics over time
```

## File Structure

```
.data/snapshots/
├── aggregation.json          # Combined compact JSON (all snapshots)
├── 2025-11-15.json          # Individual daily snapshots (backup)
├── 2025-11-16.json
├── ...
└── 2026-01-09.json
```

## Snapshot Schema

Each snapshot has the following structure:

```typescript
interface Snapshot {
  date: string;  // YYYY-MM-DD format
  
  npm: {
    totalDownloads: number;    // Cumulative total downloads (last 30 days rolling)
    dailyDownloads: number;    // Change from previous day
    packageCount: number;      // Number of npm packages (excluding blocklisted)
  };
  
  github: {
    stars: number;             // Total stars (from target repos only)
    followers: number;         // GitHub followers count
    contributions: number;     // Total contributions (cumulative)
    dailyContributions: number; // Contributions added today
    commits: number;           // Total commits (cumulative)
    dailyCommits: number;      // Commits made today
  };
  
  devto: {
    views: number;             // Total article views (cumulative)
    dailyViews: number;        // Views gained today
    followers: number;         // Dev.to followers count
    dailyFollowers: number;    // New followers today
    reactions: number;         // Total reactions (hearts/unicorns/etc)
    dailyReactions: number;    // Reactions gained today
    comments: number;          // Total comments on articles
    dailyComments: number;     // Comments added today
    articles: number;          // Number of published articles
  };
  
  ecosystem: {
    packages: number;          // Same as npm.packageCount
    plugins: number;           // ESLint plugins count (auto-detected from repo)
    rules: number;             // ESLint rules count (auto-detected from repo)
    owaspCoverage: number;     // OWASP coverage percentage (currently 100)
    testCoverage: number;      // Test coverage percentage (from Codecov)
  };
}
```

## Metric Calculation Rules

### Cumulative Metrics (totals that grow over time)
- `totalDownloads`, `views`, `reactions`, `comments`, `contributions`, `commits`
- These should **never decrease** (monotonically increasing)
- If API returns lower value (inconsistency), keep previous value

### Point-in-Time Metrics (current state)
- `stars`, `followers`, `packageCount`, `plugins`, `rules`, `articles`
- These reflect the current state at snapshot time
- May fluctuate (e.g., someone unfollows)

### Daily Deltas (change since yesterday)
- Calculated as: `today's value - yesterday's value`
- For first data point (no previous day): set to `0`
- If delta is negative: set to `0` (assume API inconsistency)

## Data Sources

### npm
- **Packages**: `https://registry.npmjs.org/-/v1/search?text=maintainer:ofriperetz`
- **Downloads**: `https://api.npmjs.org/downloads/point/last-month/{package}`
- **Filtering**: Excludes packages listed in `NPM_CONFIG.excludedPackages`:
  - `eslint-plugin-mcp`, `eslint-plugin-llm-optimized`, `eslint-plugin-llm`, `eslint-plugin-mcp-optimized`
  - Any package starting with `@forge-js/`

### GitHub
- **Target Repos**: Only `ofri-peretz/ofriperetz-dev` and `ofri-peretz/eslint`
- **Stars**: Sum of stargazers from target repos only
- **Contributions**: Via GraphQL API (`contributionsCollection`)
- **Commits**: Via GraphQL API (`totalCommitContributions`)

### Dev.to
- **Articles**: `https://dev.to/api/articles/me/all` (requires API key)
- **Views/Reactions/Comments**: Aggregated from all articles
- **Followers**: `https://dev.to/api/followers/users`

### ESLint Ecosystem
- **Plugins/Rules**: Dynamically counted from `github.com/ofri-peretz/eslint` repo
- **Excluded from count**: `cli`, `eslint-devkit`, and blocklisted plugins
- **Test Coverage**: Fetched from Codecov API

## Server-Side Fetching

The API endpoint (`/api/metrics-history`) fetches the combined aggregation file from GitHub:

```
https://raw.githubusercontent.com/ofri-peretz/ofriperetz-dev/main/.data/snapshots/aggregation.json
```

- **Production**: 1-hour cache TTL
- **Development**: 1-minute cache TTL

## Chart Display Modes

The `MetricsOverTimeChart` component supports these aggregation modes:

1. **Daily**: Shows actual value for each day
2. **Weekly**: Shows latest value of each week
3. **Monthly**: Shows latest value of each month
4. **Cumulative**: Same as daily (shows running total over time)

## Required Secrets (GitHub Actions)

- `DEVTO_API_KEY`: Dev.to API key for article stats
- `CODECOV_TOKEN`: Codecov API token for test coverage
- `GITHUB_TOKEN`: Auto-provided by GitHub Actions

## Maintenance

### Adding New Metrics
1. Update the workflow to fetch the new data
2. Add the field to the snapshot JSON structure
3. Update `aggregatedData` in `MetricsOverTimeChart.vue`
4. Update the TypeScript `Snapshot` interface

### Regenerating Historical Data
Run the snapshot generation script locally to create historical data, then push to GitHub.

### Debugging
- Check individual snapshot files in `.data/snapshots/`
- View workflow logs in GitHub Actions
- Test API response: `curl https://raw.githubusercontent.com/ofri-peretz/ofriperetz-dev/main/.data/snapshots/aggregation.json`
