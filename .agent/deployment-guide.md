# Deployment & Caching Guide

> Reference for understanding the ofriperetz.dev deployment architecture, caching strategy, and known trade-offs.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Request                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                           │
│  (100+ global CDN nodes cache static HTML)                       │
│  Cache-Control: public, max-age=0, must-revalidate               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Static HTML (Prerendered)                     │
│  Built at deploy time via `nuxt build`                           │
│  References hashed JS/CSS: _nuxt/Hero.abc123.js                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Client Hydration                              │
│  Vue takes over, makes page interactive                          │
│  chunk-error-handler.client.ts monitors for 404s                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Rendering Modes Explained

### Static Prerendering (Current) ✅

```typescript
routeRules: {
  '/': { prerender: true }
}
```

| Pros                             | Cons                            |
| -------------------------------- | ------------------------------- |
| Fastest first load (Edge-served) | Split-Brain risk during deploys |
| Perfect SEO (full HTML)          | Content requires redeploy       |
| 100% availability                | Possible hydration mismatches   |

### Server-Side Rendering (SSR) ❌

```typescript
routeRules: {
  '/': { ssr: true, prerender: false }
}
```

| Pros                 | Cons                                     |
| -------------------- | ---------------------------------------- |
| Always fresh content | **Broken on Vercel for this app** (404s) |
| No Split-Brain       | Slower (Lambda cold starts)              |

### Incremental Static Regeneration (ISR)

```typescript
routeRules: {
  '/': { swr: 3600 } // Stale-while-revalidate
}
```

| Pros                       | Cons                         |
| -------------------------- | ---------------------------- |
| Best of both worlds        | Not tested after SSR failure |
| Fresh content + Edge speed | May have same 404 issue      |

---

## Known Issues & Trade-offs

### 1. Split-Brain (Mitigated)

**Risk:** During deployment, some Edge nodes serve old HTML → 404 for new JS.

**Mitigation:** `chunk-error-handler.client.ts` auto-reloads.

### 2. Hydration Mismatches (Cosmetic)

**Console Error:** `Hydration completed but contains mismatches.`

**Cause:** Content rendered at build time differs from what client expects:

- Timestamps (build time vs current time)
- Dynamic IDs
- Browser-specific conditions

**Impact:** None visible to users. App works correctly.

**Future Fix:** Wrap dynamic content in `<ClientOnly>` or use `useNuxtApp().isHydrating`.

### 3. Minification Disabled (Trade-off)

**Cause:** TDZ errors with `@nuxt/content` + Vue 3 + manualChunks.

**Impact:** ~15% larger bundle (~100KB on 600KB).

**Compensation:** Vercel applies Brotli compression at Edge.

---

## Deployment Checklist

```bash
# 1. Test locally
pnpm dev

# 2. Build locally to catch errors
pnpm build

# 3. Commit with conventional commits
git add .
git commit -m "feat: description"

# 4. Push (auto-deploys via Vercel GitHub integration)
git push origin main

# 5. Force deploy if cache issues persist
vercel --prod --force
```

---

## Emergency Recovery

If site is broken after deploy:

```bash
# Option A: Force redeploy with cache purge
vercel --prod --force

# Option B: Rollback via Vercel Dashboard
# Go to: vercel.com/[project]/deployments
# Click "..." on previous working deployment → "Promote to Production"
```

---

## Configuration Reference

### nuxt.config.ts (Key Settings)

```typescript
routeRules: {
  '/': { prerender: true },
  '/projects': { prerender: true },
  '/articles': { prerender: true },
  '/api/**': { cache: { maxAge: 60 } }
},

nitro: {
  preset: 'vercel',
  prerender: {
    routes: ['/', '/projects', '/articles'],
    crawlLinks: false,
    ignore: ['/stats', '/api']
  }
},

vite: {
  build: {
    minify: false // Prevents TDZ errors
  }
}
```

### Files

| File                                        | Purpose                                       |
| ------------------------------------------- | --------------------------------------------- |
| `nuxt.config.ts`                            | Main app configuration                        |
| `vercel.json.disabled`                      | Legacy config (disabled to prevent conflicts) |
| `app/plugins/chunk-error-handler.client.ts` | Auto-reload on JS 404                         |
| `.agent/error_log.md`                       | Lessons learned                               |

---

## Future Optimization Opportunities

1. **Re-enable Minification**
   - Remove `manualChunks` completely (already done)
   - Set `minify: 'esbuild'`
   - Test for TDZ errors in production

2. **Investigate SSR 404s**
   - Check Vercel function logs
   - Open support ticket if persistent
   - Once fixed, switch to ISR for best UX

3. **Fix Hydration Mismatches**
   - Identify dynamic components
   - Wrap in `<ClientOnly>`
   - Reduces console noise

---

_Last updated: 2026-01-11_
