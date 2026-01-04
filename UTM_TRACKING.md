# UTM & Referrer Tracking Guide

## Overview

This document tracks all UTM parameters, referrer configurations, and outbound CTAs for ofriperetz.dev analytics.

---

## Outbound CTA Map (Links FROM Website)

All external links on ofriperetz.dev, organized by page.

### Homepage (`/`)

| CTA                   | Destination                 | Platform | Tracked Event          |
| --------------------- | --------------------------- | -------- | ---------------------- |
| "Explore My Projects" | `/projects`                 | Internal | pageview               |
| "Let's Talk"          | linkedin.com/in/ofri-peretz | LinkedIn | `contact_intent_click` |
| Social Icons          | Various platforms           | Multiple | platform-specific      |

### Stats Page (`/stats`)

| CTA                          | Destination                   | Platform | Tracked Event          |
| ---------------------------- | ----------------------------- | -------- | ---------------------- |
| Package names                | npmjs.com/package/[name]      | npm      | -                      |
| "View All on npm"            | npmjs.com/~ofriperetz         | npm      | -                      |
| "Interlace ESLint Ecosystem" | github.com/ofri-peretz/eslint | GitHub   | -                      |
| "View on npm" button         | npmjs.com/~ofriperetz         | npm      | -                      |
| "View on GitHub" button      | github.com/ofri-peretz        | GitHub   | -                      |
| "View on dev.to" button      | dev.to/ofri-peretz            | Dev.to   | -                      |
| "Explore the Interlace..."   | github.com/ofri-peretz/eslint | GitHub   | -                      |
| "Let's Talk"                 | linkedin.com/in/ofri-peretz   | LinkedIn | `contact_intent_click` |

### Projects Page (`/projects`)

| CTA                       | Destination                   | Platform | Tracked Event |
| ------------------------- | ----------------------------- | -------- | ------------- |
| "View on GitHub"          | github.com/ofri-peretz/eslint | GitHub   | -             |
| "View on NPM"             | npmjs.com/~ofriperetz         | npm      | -             |
| "View Project" (per card) | npmjs.com/package/[name]      | npm      | -             |

### Articles Page (`/articles`)

| CTA                       | Destination               | Platform | Tracked Event |
| ------------------------- | ------------------------- | -------- | ------------- |
| Article cards             | dev.to/ofri-peretz/[slug] | Dev.to   | -             |
| "Read More on dev.to"     | dev.to/ofri-peretz        | Dev.to   | -             |
| "View Articles on Medium" | medium.com/@ofriperetz    | Medium   | -             |

### About Page (`/about`)

| CTA           | Destination                 | Platform | Tracked Event          |
| ------------- | --------------------------- | -------- | ---------------------- |
| "Let's Talk"  | linkedin.com/in/ofri-peretz | LinkedIn | `contact_intent_click` |
| Company links | linkedin.com/company/[name] | LinkedIn | -                      |

### Footer (All Pages)

| CTA            | Destination                 | Platform | Tracked Event          |
| -------------- | --------------------------- | -------- | ---------------------- |
| GitHub icon    | github.com/ofri-peretz      | GitHub   | `github_click`         |
| LinkedIn icon  | linkedin.com/in/ofri-peretz | LinkedIn | `linkedin_click`       |
| X/Twitter icon | x.com/ofri_peretz           | Twitter  | -                      |
| Dev.to icon    | dev.to/ofri-peretz          | Dev.to   | -                      |
| Medium icon    | medium.com/@ofriperetz      | Medium   | -                      |
| npm icon       | npmjs.com/~ofriperetz       | npm      | -                      |
| "Let's Talk"   | linkedin.com/in/ofri-peretz | LinkedIn | `contact_intent_click` |

---

## Referrer Attribution

When users click outbound links, the destination receives:

- **Referer header**: `https://ofriperetz.dev`
- **Page context**: The page URL they clicked from

Most platforms (npm, GitHub, Dev.to) track this automatically in their analytics.

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

### LinkedIn (5 Placements)

| Placement                                | Full UTM URL                                                                                 | Status |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| **Profile Bio** (About section)          | `https://ofriperetz.dev?utm_source=linkedin&utm_medium=profile&utm_campaign=bio`             | ⏳     |
| **Contact Info** (Website field)         | `https://ofriperetz.dev?utm_source=linkedin&utm_medium=profile&utm_campaign=contact-info`    | ⏳     |
| **Work Experience** (Snappy description) | `https://ofriperetz.dev?utm_source=linkedin&utm_medium=profile&utm_campaign=work-experience` | ⏳     |
| **Featured Section**                     | `https://ofriperetz.dev?utm_source=linkedin&utm_medium=profile&utm_campaign=featured`        | ⏳     |
| **Post Links** (when sharing)            | `https://ofriperetz.dev?utm_source=linkedin&utm_medium=social&utm_campaign=post`             | ⏳     |

### Dev.to (4 Placements)

| Placement                        | Full UTM URL                                                                                              | Status   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| **Author Bio** (Profile page)    | `https://ofriperetz.dev?utm_source=devto&utm_medium=profile&utm_campaign=bio`                             | ⏳       |
| **Website Field**                | `https://ofriperetz.dev?utm_source=devto&utm_medium=profile&utm_campaign=website-field`                   | ⏳       |
| **Article Footer** (per article) | `https://ofriperetz.dev?utm_source=devto&utm_medium=article&utm_campaign=ARTICLE-SLUG`                    | Template |
| **Article Inline** (body links)  | `https://ofriperetz.dev?utm_source=devto&utm_medium=article&utm_campaign=ARTICLE-SLUG&utm_content=inline` | Template |

### Medium (3 Placements)

| Placement          | Full UTM URL                                                                                     | Status   |
| ------------------ | ------------------------------------------------------------------------------------------------ | -------- |
| **Profile Bio**    | `https://ofriperetz.dev?utm_source=medium&utm_medium=profile&utm_campaign=bio`                   | ⏳       |
| **Article Footer** | `https://ofriperetz.dev?utm_source=medium&utm_medium=article&utm_campaign=ARTICLE-SLUG`          | Template |
| **Article CTA**    | `https://ofriperetz.dev/projects?utm_source=medium&utm_medium=article&utm_campaign=ARTICLE-SLUG` | Template |

### GitHub (4 Placements)

| Placement                        | Full UTM URL                                                                           | Status   |
| -------------------------------- | -------------------------------------------------------------------------------------- | -------- |
| **Profile README**               | `https://ofriperetz.dev?utm_source=github&utm_medium=profile&utm_campaign=readme`      | ⏳       |
| **Bio Website**                  | `https://ofriperetz.dev?utm_source=github&utm_medium=profile&utm_campaign=bio-website` | ⏳       |
| **ESLint Repo README**           | `https://ofriperetz.dev?utm_source=github&utm_medium=repo&utm_campaign=eslint-readme`  | ⏳       |
| **Package README** (per package) | `https://ofriperetz.dev?utm_source=github&utm_medium=repo&utm_campaign=PACKAGE-NAME`   | Template |

### Twitter/X (2 Placements)

| Placement       | Full UTM URL                                                                     | Status   |
| --------------- | -------------------------------------------------------------------------------- | -------- |
| **Bio Link**    | `https://ofriperetz.dev?utm_source=twitter&utm_medium=profile&utm_campaign=bio`  | ⏳       |
| **Tweet Links** | `https://ofriperetz.dev?utm_source=twitter&utm_medium=social&utm_campaign=tweet` | Template |

### npm (2 Placements)

| Placement                        | Full UTM URL                                                                         | Status   |
| -------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| **Author Profile**               | `https://ofriperetz.dev?utm_source=npm&utm_medium=profile&utm_campaign=author-page`  | ⏳       |
| **Package README** (per package) | `https://ofriperetz.dev?utm_source=npm&utm_medium=package&utm_campaign=PACKAGE-NAME` | Template |

### Email (2 Placements)

| Placement                      | Full UTM URL                                                                         | Status |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------ |
| **Email Signature** (personal) | `https://ofriperetz.dev?utm_source=email&utm_medium=signature&utm_campaign=personal` | ⏳     |
| **Email Signature** (work)     | `https://ofriperetz.dev?utm_source=email&utm_medium=signature&utm_campaign=work`     | ⏳     |

### Quick Reference Summary

| Platform  | Placements | Ready to Copy |
| --------- | ---------- | ------------- |
| LinkedIn  | 5          | ✅ See above  |
| Dev.to    | 4          | ✅ See above  |
| Medium    | 3          | ✅ See above  |
| GitHub    | 4          | ✅ See above  |
| Twitter   | 2          | ✅ See above  |
| npm       | 2          | ✅ See above  |
| Email     | 2          | ✅ See above  |
| **Total** | **22**     | -             |

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
