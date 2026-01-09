# Daily Metrics Snapshot Workflow

> Automated daily capture of metrics from npm, GitHub, and Dev.to APIs to power the "Metrics Over Time" chart.

## 🎯 Purpose

This workflow collects and stores daily metrics snapshots that enable historical trend visualization on the portfolio site's Impact Dashboard.

## 📊 Data Captured

| Source        | Cumulative Metrics               | Point-in-Time Metrics              |
| ------------- | -------------------------------- | ---------------------------------- |
| **npm**       | `totalDownloads`                 | `packageCount`                     |
| **GitHub**    | `contributions`, `commits`       | `stars`, `followers`               |
| **Dev.to**    | `views`, `reactions`, `comments` | `followers`, `articles`            |
| **Ecosystem** | —                                | `plugins`, `rules`, `testCoverage` |

Each snapshot also calculates **daily deltas** (change from previous snapshot) for trending analysis.

## ⏰ Schedule & Triggers

| Trigger | Time (UTC) | Purpose                   |
| ------- | ---------- | ------------------------- |
| Primary | 6:00 AM    | Main daily capture        |
| Retry 1 | 12:00 PM   | Fallback if primary fails |
| Retry 2 | 6:00 PM    | Fallback if both fail     |
| Manual  | On-demand  | `workflow_dispatch`       |

## 🛡️ Resilience Mechanisms

| Mechanism                     | Description                                                             |
| ----------------------------- | ----------------------------------------------------------------------- |
| **Upsert behavior**           | If today's snapshot exists, it gets overwritten with fresh data         |
| **Lookback for previous**     | Searches up to 7 days back for last snapshot (handles missed days)      |
| **API retry with backoff**    | Each API call retries 3x with exponential backoff (2s → 4s → 8s)        |
| **Negative delta protection** | If API returns lower value than previous day, delta = 0                 |
| **Fallback values**           | If eslint repo clone fails, uses known fallback (11 plugins, 216 rules) |

## 📁 Output Files

| File                               | Purpose                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| `.data/snapshots/YYYY-MM-DD.json`  | Individual daily backup                                             |
| `.data/snapshots/aggregation.json` | Combined compact JSON for fast API loading (max 365 days, minified) |

The `aggregation.json` file is the source of truth for the `/api/metrics-history` endpoint, fetched directly from GitHub's raw content API.

## 🔐 Required Secrets

| Secret          | Purpose                         |
| --------------- | ------------------------------- |
| `DEVTO_API_KEY` | Authenticated Dev.to API access |
| `GITHUB_TOKEN`  | Auto-provided by GitHub Actions |
| `CODECOV_TOKEN` | Fetching test coverage metrics  |

## 🔄 Data Flow

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   npm Registry  │      │  GitHub GraphQL │      │    Dev.to API   │
│   + Downloads   │      │  + Contributions│      │  + Views/Reacts │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                    ┌─────────────────────────┐
                    │   Calculate Deltas      │
                    │   (compare to previous) │
                    └────────────┬────────────┘
                                 ▼
              ┌──────────────────┴──────────────────┐
              ▼                                      ▼
    ┌─────────────────┐                   ┌─────────────────┐
    │ YYYY-MM-DD.json │                   │ aggregation.json│
    │   (backup)      │                   │   (API source)  │
    └─────────────────┘                   └─────────────────┘
                                                   │
                                                   ▼
                                    ┌─────────────────────────┐
                                    │ /api/metrics-history    │
                                    │ (fetches from GitHub    │
                                    │  raw content URL)       │
                                    └─────────────────────────┘
```

## 📐 Key Design Decisions

1. **Selective Repository Tracking**: Only counts stars from `ofriperetz-dev` and `eslint` repos
2. **Package Exclusions**: Filters out test/deprecated packages (`eslint-plugin-mcp`, `@forge-js/*`, etc.)
3. **Compact Aggregation**: Uses `jq -c` for minified JSON to reduce file size
4. **Rolling 365-day Window**: Keeps only last year of data to prevent unbounded growth
5. **Git-based Storage**: Commits to repo = version history + works with GitHub raw content API
6. **Upsert Pattern**: Re-running the workflow updates today's data instead of skipping

## 🧪 Manual Testing

```bash
# Trigger workflow manually via GitHub CLI
gh workflow run daily-snapshot.yml

# Or via GitHub UI: Actions → Daily Metrics Snapshot → Run workflow
```

## 📋 Snapshot Schema

```json
{
  "date": "2026-01-09",
  "npm": {
    "totalDownloads": 9208,
    "dailyDownloads": 26,
    "packageCount": 14
  },
  "github": {
    "stars": 1,
    "followers": 6,
    "contributions": 602,
    "dailyContributions": 4,
    "commits": 560,
    "dailyCommits": 3
  },
  "devto": {
    "views": 1689,
    "dailyViews": 11,
    "followers": 89,
    "dailyFollowers": 1,
    "reactions": 10,
    "dailyReactions": 0,
    "comments": 9,
    "dailyComments": 0,
    "articles": 28
  },
  "ecosystem": {
    "packages": 14,
    "plugins": 15,
    "rules": 221,
    "owaspCoverage": 100,
    "testCoverage": 90
  }
}
```

## 🔗 Related Files

- **Workflow**: [`.github/workflows/daily-snapshot.yml`](./workflows/daily-snapshot.yml)
- **API Endpoint**: [`server/api/metrics-history.get.ts`](../server/api/metrics-history.get.ts)
- **Chart Component**: [`app/components/landing/MetricsOverTimeChart.vue`](../app/components/landing/MetricsOverTimeChart.vue)
