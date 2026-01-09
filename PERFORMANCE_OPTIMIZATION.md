# ofriperetz.dev Performance Optimization Report

**Date:** January 8, 2026  
**Analyzed by:** Antigravity Agent

---

## Executive Summary

I analyzed your website's bundle, performance, and the profile image issue. Here are my findings:

### ✅ Profile Image Issue - RESOLVED

The profile image **IS loading correctly**. The perceived issue was due to:

1. **Animation delay** - The Motion component starts with `opacity: 0` and animates in over 0.6s
2. **Image size** - At 256KB for a 379x395 image, it takes time to load
3. **Missing preload** - Browser wasn't prioritizing the image load

**Fix Applied:** Added `<link rel="preload">` for the profile image in `nuxt.config.ts`

---

## Bundle Analysis

### Current Bundle Sizes

| Category               | Size        | Status                |
| ---------------------- | ----------- | --------------------- |
| Total JS (\_nuxt/)     | **9.5 MB**  | ⚠️ High               |
| Total Output (gzipped) | **14.6 MB** | Build includes server |
| Fonts                  | 492 KB      | ✅ Good               |
| OG Images              | ~2.5 MB     | ⚠️ High               |

### Top 5 Largest JS Chunks

| File                          | Size       | Concern                  |
| ----------------------------- | ---------- | ------------------------ |
| `-yL7jHw-.js`                 | 608 KB     | Vendor bundle            |
| `BMqUg8oV.js`                 | 451 KB     | Vue/Nuxt core            |
| `ZFJ4Z-Se.js`                 | 446 KB     | Framework                |
| `sqlite3-worker1-bundler*.js` | **189 KB** | ⚠️ **SQLite in client!** |
| `BcoEISi6.js`                 | 192 KB     | App code                 |

---

## Optimizations Applied

### 1. Image Screen Sizes (Console Warning Fix)

```typescript
// nuxt.config.ts - image.screens
screens: {
  avatar: 128,    // NEW - fixes warning for profile image
  avatarLg: 256,  // NEW - fixes warning for larger avatar
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
}
```

### 2. Profile Image Preload

```typescript
// nuxt.config.ts - app.head.link
{ rel: 'preload', href: '/ofri-profile.png', as: 'image', type: 'image/png' }
```

### 3. Production Sourcemaps Disabled

```typescript
// nuxt.config.ts - vite.build
sourcemap: false;
```

---

## Recommended Additional Optimizations

### High Impact 🔥

#### 1. Convert Images to WebP/AVIF

Your images are unnecessarily large:

| Image            | Current | Estimated WebP       |
| ---------------- | ------- | -------------------- |
| ofri-profile.png | 256 KB  | ~30-40 KB            |
| profile.png      | 256 KB  | (duplicate - delete) |
| og-stats.png     | 460 KB  | ~80-100 KB           |
| og-articles.png  | 424 KB  | ~70-90 KB            |

**Action:**

```bash
# Install webp tools
brew install webp

# Convert profile image
cwebp -q 85 public/ofri-profile.png -o public/ofri-profile.webp
```

Then update `app.config.ts`:

```typescript
global: {
  picture: {
    dark: '/ofri-profile.webp',
    light: '/ofri-profile.webp',
    alt: 'Ofri Peretz'
  }
}
```

#### 2. Investigate SQLite in Client Bundle

You have `better-sqlite3` as a dependency and it's being bundled for the client:

- File: `sqlite3-worker1-bundler-friendly-Ds-6LPzH.js` (189 KB)

This is likely from `@nuxt/content` and should be server-only. Consider:

```typescript
// nuxt.config.ts
vite: {
  build: {
    rollupOptions: {
      external: ["better-sqlite3"];
    }
  }
}
```

#### 3. Remove Duplicate Profile Image

You have TWO identical 256KB files:

- `public/ofri-profile.png`
- `public/profile.png`

Delete one and update references.

### Medium Impact 📊

#### 4. Lazy Load Heavy Components

Your stats page loads heavy visualizations. Consider:

```vue
<template>
  <LazyNorthStarFunnel v-if="showFunnel" />
  <LazyNorthStarWeb v-if="showWeb" />
</template>
```

#### 5. Optimize OG Images

OG images total ~2.5 MB. Consider:

- Use JPEG instead of PNG (smaller for photos)
- Compress more aggressively (they're only for social previews)
- Use a single template OG image with dynamic text overlay

### Low Impact 💡

#### 6. Code-Split Motion Library

`motion-v` adds animation overhead. Consider loading it lazily:

```typescript
// Only import where needed
const Motion = defineAsyncComponent(() => import("motion-v"));
```

---

## Performance Metrics to Monitor

After implementing these optimizations, measure:

1. **Lighthouse Score** - Target: 90+ Performance
2. **First Contentful Paint (FCP)** - Target: < 1.5s
3. **Largest Contentful Paint (LCP)** - Target: < 2.5s
4. **Total Blocking Time (TBT)** - Target: < 200ms
5. **Cumulative Layout Shift (CLS)** - Target: < 0.1

---

## Quick Wins Summary

| Optimization                      | Impact | Effort |
| --------------------------------- | ------ | ------ |
| ✅ Added image preload            | Medium | Done   |
| ✅ Added missing screen sizes     | Low    | Done   |
| ✅ Disabled production sourcemaps | Medium | Done   |
| Convert to WebP                   | High   | 10 min |
| Delete duplicate profile.png      | Low    | 1 min  |
| Investigate SQLite bundle         | High   | 30 min |
| Lazy load visualizations          | Medium | 15 min |

---

## Next Steps

1. **Run a new build** to see impact of changes:

   ```bash
   pnpm build
   ```

2. **Install WebP and convert images**:

   ```bash
   brew install webp
   for f in public/*.png; do cwebp -q 80 "$f" -o "${f%.png}.webp"; done
   ```

3. **Run Lighthouse audit** on production to get baseline metrics

4. **Monitor Vercel analytics** for real user performance data
