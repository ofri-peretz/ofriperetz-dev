# UTM & Referrer Tracking Guide

## Overview

This document tracks all UTM parameters and referrer configurations for ofriperetz.dev analytics.

---

## How UTM Parameters Work

UTM parameters are added to **inbound links** (links pointing TO your website) to track where visitors come from.

### UTM Parameter Structure

```
https://ofriperetz.dev?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN&utm_content=CONTENT
```

| Parameter      | Purpose              | Examples                                            |
| -------------- | -------------------- | --------------------------------------------------- |
| `utm_source`   | Platform/site name   | `linkedin`, `devto`, `medium`, `twitter`, `github`  |
| `utm_medium`   | Marketing channel    | `social`, `article`, `profile`, `email`, `referral` |
| `utm_campaign` | Campaign identifier  | `2026q1`, `eslint-launch`, `bio-link`               |
| `utm_content`  | Specific content/CTA | `hero-cta`, `article-footer`, `sidebar`             |

---

## Inbound Link Templates

Use these when sharing links to ofriperetz.dev on external platforms.

### LinkedIn

```
# Profile bio link
https://ofriperetz.dev?utm_source=linkedin&utm_medium=social&utm_campaign=bio-link

# Post about ESLint ecosystem
https://ofriperetz.dev/projects?utm_source=linkedin&utm_medium=social&utm_campaign=eslint-promo&utm_content=post

# Comment/reply link
https://ofriperetz.dev?utm_source=linkedin&utm_medium=social&utm_campaign=engagement
```

### Dev.to

```
# Author bio link
https://ofriperetz.dev?utm_source=devto&utm_medium=profile&utm_campaign=bio-link

# Article footer CTA
https://ofriperetz.dev/projects?utm_source=devto&utm_medium=article&utm_campaign=article-cta&utm_content=footer

# Inline article link
https://ofriperetz.dev/stats?utm_source=devto&utm_medium=article&utm_campaign=article-cta&utm_content=inline
```

### Medium

```
# Profile bio link
https://ofriperetz.dev?utm_source=medium&utm_medium=profile&utm_campaign=bio-link

# Article CTA
https://ofriperetz.dev?utm_source=medium&utm_medium=article&utm_campaign=article-cta
```

### GitHub

```
# Profile README link
https://ofriperetz.dev?utm_source=github&utm_medium=profile&utm_campaign=readme

# Repository README link
https://ofriperetz.dev?utm_source=github&utm_medium=repo&utm_campaign=eslint-ecosystem
```

### Twitter/X

```
# Bio link
https://ofriperetz.dev?utm_source=twitter&utm_medium=social&utm_campaign=bio-link

# Tweet link
https://ofriperetz.dev?utm_source=twitter&utm_medium=social&utm_campaign=tweet
```

### npm

```
# Package README link
https://ofriperetz.dev?utm_source=npm&utm_medium=package&utm_campaign=readme
```

### Email Signature

```
https://ofriperetz.dev?utm_source=email&utm_medium=signature&utm_campaign=personal
```

---

## Current Outbound Click Tracking

Our `/api/track` endpoint logs these user actions:

| Event                  | Description              | Logged Data             |
| ---------------------- | ------------------------ | ----------------------- |
| `pageview`             | Every page visit         | page, referrer, IP, geo |
| `contact_intent_click` | "Let's Talk" CTA clicked | timestamp, page         |
| `linkedin_click`       | LinkedIn icon clicked    | timestamp, page         |
| `github_click`         | GitHub icon clicked      | timestamp, page         |
| `resume_click`         | Resume/CV clicked        | timestamp, page         |

---

## UTM Audit Log

Track which UTM links you've deployed and where.

### Active UTM Links

| Platform | Location       | URL                                                                          | Date Added | Status     |
| -------- | -------------- | ---------------------------------------------------------------------------- | ---------- | ---------- |
| LinkedIn | Profile bio    | `ofriperetz.dev?utm_source=linkedin&utm_medium=social&utm_campaign=bio-link` | TBD        | ⏳ Pending |
| Dev.to   | Author bio     | `ofriperetz.dev?utm_source=devto&utm_medium=profile&utm_campaign=bio-link`   | TBD        | ⏳ Pending |
| GitHub   | Profile README | `ofriperetz.dev?utm_source=github&utm_medium=profile&utm_campaign=readme`    | TBD        | ⏳ Pending |
| Medium   | Profile bio    | `ofriperetz.dev?utm_source=medium&utm_medium=profile&utm_campaign=bio-link`  | TBD        | ⏳ Pending |
| Twitter  | Bio link       | `ofriperetz.dev?utm_source=twitter&utm_medium=social&utm_campaign=bio-link`  | TBD        | ⏳ Pending |

---

## UTM Builder Template

When creating a new UTM link, fill in this template:

```
Base URL: https://ofriperetz.dev/[PAGE]

utm_source: [platform name - lowercase]
utm_medium: [channel type]
  - social (social media posts)
  - profile (bio/about sections)
  - article (blog post links)
  - email (email campaigns)
  - referral (other sites linking)
  - repo (GitHub repository)
  - package (npm package)

utm_campaign: [campaign identifier]
  - bio-link (permanent profile links)
  - article-cta (article call-to-actions)
  - eslint-promo (ESLint ecosystem promotion)
  - 2026q1 (quarterly campaign)

utm_content: [optional - specific placement]
  - header
  - footer
  - sidebar
  - inline
  - post
```

---

## Viewing UTM Data

1. **Vercel Analytics**: Dashboard → Referrers → UTM Parameters
2. **Custom Tracking**: Vercel Logs → Search `[VISITOR]`

---

## Best Practices

1. **Be consistent** - Use lowercase, hyphens, no spaces
2. **Be specific** - Include enough detail to identify the source
3. **Update this doc** - Log every new UTM link you deploy
4. **Review monthly** - Check which sources drive traffic

---

## Quick Copy Links

### Most Common UTMs

```
# LinkedIn bio
https://ofriperetz.dev?utm_source=linkedin&utm_medium=social&utm_campaign=bio-link

# Dev.to bio
https://ofriperetz.dev?utm_source=devto&utm_medium=profile&utm_campaign=bio-link

# GitHub profile
https://ofriperetz.dev?utm_source=github&utm_medium=profile&utm_campaign=readme

# Article footer (replace PLATFORM and ARTICLE-SLUG)
https://ofriperetz.dev?utm_source=PLATFORM&utm_medium=article&utm_campaign=ARTICLE-SLUG
```
