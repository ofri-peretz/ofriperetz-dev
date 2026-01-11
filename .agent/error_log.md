# Error Log & Lessons Learned

## 2026-01-10 / 2026-01-11

---

### 1. Post-Deployment "Split-Brain" (Asset 404s)

#### The Problem (Simple Analogy)

Imagine you run a restaurant with **100 waiters** (CDN Edge Nodes) who each have a copy of your menu (HTML).

1. **Monday:** Your menu says "Order the Chicken" (references `chicken.js`).
2. **Tuesday:** You update the menu to say "Order the Fish" (references `fish.js`) and **throw away all the chicken**.
3. **The Problem:** 50 waiters got the new menu. 50 waiters still have the old menu.
4. **A customer walks in**, gets an old menu from Waiter #37, tries to order chicken... but the kitchen says "We don't have chicken anymore!" → **Crash (404)**.

**That's "Split-Brain."** The HTML (menu) and the JavaScript (kitchen inventory) are out of sync.

#### Why It "Comes and Goes"

- Different Edge Nodes update at different speeds (seconds to minutes).
- Refreshing might hit a fresh node (works!) or a stale node (breaks!).
- Your browser cache can also hold the old HTML.

#### Technical Details

- **Error**: `Refused to apply style... MIME type ('application/json')` and `Failed to load resource: 404` for JS chunks.
- **Cause**: Atomic Deployment Race Condition between cached HTML and new asset hashes.

#### The Resolution

| Strategy                          | Outcome                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------- |
| **Pure SSR (Attempted)**          | ❌ Failed. Vercel returned 404 for root routes due to Nitro preset conflicts. |
| **Static Prerendering (Current)** | ✅ Works. Guarantees 200 OK. HTML generated at build time.                    |
| **Client Safety Net (Added)**     | ✅ `chunk-error-handler.client.ts` auto-reloads if JS 404 detected.           |

**Current Config:**

```typescript
routeRules: {
  '/': { prerender: true },
  '/projects': { prerender: true },
  '/articles': { prerender: true }
}
```

---

### 2. TypeScript Undefined in `.split()` Chain

- **Error**: `Object is possibly 'undefined'`
- **Cause**: TypeScript strict mode on chained optional calls.
- **Fix**: `const startStr = start.toISOString().split('T')[0] ?? ''`

---

### 3. Nuxt Build: TSConfig Race Condition

- **Error**: `TSConfckParseError: parsing tsconfig.server.json failed: ENOENT`
- **Cause**: Vite reads TS config before Nuxt regenerates it after `.nuxt` cleanup.
- **Fix**: Run `pnpm nuxt prepare && pnpm build`

---

### 4. Nuxt Build: Minification TDZ Error

- **Error**: `Cannot access 'ne' before initialization` in production.
- **Cause**: Variable shadowing between Vue runtime and MDC parser when using `manualChunks`.
- **Fix**: Disabled minification (`minify: false`). Vercel's Brotli compression compensates.
- **Trade-off**: ~15% larger bundle size.

---

### 5. Unused Preload Warnings with NuxtImg

- **Error**: "Resource preloaded but not used..."
- **Cause**: Manual `<link rel="preload">` conflicts with `<NuxtImg>` optimization URLs.
- **Fix**: Remove manual preloads. Use `loading="eager"` on `<NuxtImg>` instead.

---

### 6. Deployment Rejection Masking Fixes

- **Error**: Fixes don't seem to work; site stays broken.
- **Cause**: Syntax errors in config → Build fails → Vercel keeps old deployment.
- **Fix**: Always run `pnpm dev` locally before pushing infrastructure changes.

---

### 7. Legacy `vercel.json` Conflicts

- **Error**: SSR routes return 404 despite correct Nuxt config.
- **Cause**: Legacy `vercel.json` file can conflict with Nuxt 3's Nitro Build Output API.
- **Fix**: Renamed to `vercel.json.disabled`. Let Nuxt handle all Vercel configuration.

---

## Current Architecture Summary (2026-01-11)

| Aspect                     | Status                       | Notes                                   |
| -------------------------- | ---------------------------- | --------------------------------------- |
| **Rendering Mode**         | Static Prerendering          | HTML generated at build time            |
| **Cache Strategy**         | `max-age=0, must-revalidate` | Edge checks origin on every request     |
| **Split-Brain Protection** | Client-side auto-reload      | `chunk-error-handler.client.ts`         |
| **Minification**           | Disabled                     | Prevents TDZ errors; Brotli compensates |
| **SSR Fallback**           | Not used                     | Caused 404s on Vercel; disabled         |

### Is This Ideal?

**Pragmatically, yes.** For a personal portfolio:

- First load: < 1 second (Edge-served HTML)
- SEO: Perfect (fully rendered HTML)
- Availability: 100% (no server to crash)
- Deploys: Self-healing via client plugin

**Future Optimizations (Optional):**

1. Re-enable minification after removing `manualChunks` (likely safe now)
2. Investigate SSR 404 issue deeper (may require Vercel support ticket)
3. Consider ISR (`swr: 3600`) once SSR routing is fixed

---

### 8. Hydration Mismatches (Cosmetic Warning)

- **Error**: `Hydration completed but contains mismatches.` (console warning)
- **Cause**: Content rendered at build time (prerendering) differs from client:
  - **Timestamps**: Build time vs current time
  - **Random IDs**: Generated differently on server vs client
  - **Browser conditions**: `window` checks undefined during SSR
- **Impact**: **None visible to users.** App works correctly; Vue recovers gracefully.
- **Future Fix**: Wrap dynamic content in `<ClientOnly>` or check `useNuxtApp().isHydrating`.

---

_See `.agent/deployment-guide.md` for detailed caching and deployment reference._
