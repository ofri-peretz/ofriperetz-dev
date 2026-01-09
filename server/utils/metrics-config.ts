// Centralized configuration for metrics tracking
// This is the SINGLE SOURCE OF TRUTH for what data sources we track
// All GitHub API calls MUST filter data to only these repositories

export const GITHUB_CONFIG = {
  username: 'ofri-peretz',
  // Only count metrics from these specific repositories
  // Used by: github-stats.get.ts for stars, forks, watchers, topRepos, languages
  targetedRepos: ['ofriperetz-dev', 'eslint'] as const
}

export const NPM_CONFIG = {
  username: 'ofriperetz',
  // Packages to exclude from stats (experimental/deprecated)
  excludedPackages: [
    'eslint-plugin-mcp',
    'eslint-plugin-llm-optimized',
    'eslint-plugin-llm',
    'eslint-plugin-mcp-optimized'
  ],
  // Also exclude any packages with these prefixes
  excludedPrefixes: ['@forge-js/']
}

export const DEVTO_CONFIG = {
  username: 'ofri-peretz'
}

// Measurement start date - all historical data begins from here
export const MEASUREMENT_START_DATE = '2025-12-01'
