# Error Log & Lessons Learned

## 2026-01-10

### 1. Post-Deployment Split-Brain (Asset 404s)

- **Error**: `Refused to apply style... MIME type ('application/json')` and `Failed to load resource: 404` for cached JS chunks (e.g., `_nuxt/HASH.js`). Site gets stuck "Loading...".
- **Cause**: **Atomic Deployment Race Condition**.
  1.  **Stale HTML**: The user's browser (or CDN Edge Node) holds a cached version of `index.html` from Deployment A. This HTML references `Script_A.js`.
  2.  **New Assets**: The server (Vercel) has switched to Deployment B. It deleted `Script_A.js` and now only serves `Script_B.js`.
  3.  **The Crash**: The browser loads the Stale HTML, tries to fetch `Script_A.js`, gets a 404, and the application fails to hydrate.
  4.  **Persistence**: If the HTML was served with aggressive caching headers (`prerender: true` generates static files), the 404 state persists until the user's cache expires or is manually cleared.
- **Lesson**: Pure Static Generation (SSG) with hashed assets is risky on CDNs if caching rules aren't perfectly synchronized. HTML must never be aggressively cached if assets change frequently.
- **Fix (The "ISR Pivot")**:
  1.  **Configuration Change**: In `nuxt.config.ts`, we replaced `prerender: true` with `swr: 3600` (Incremental Static Regeneration).

  ```typescript
  routeRules: {
    '/': { swr: 3600 },        // Was: { prerender: true }
    '/projects': { swr: 3600 } // Was: { prerender: true }
  }
  ```

  2.  **What is ISR?**: Incremental Static Regeneration allows you to create or update content _after_ the site has been deployed. Unlike SSG (built once), ISR pages are generated on-demand by a **Serverless Function (Lambda)** and then cached at the Edge for the specified TTL (e.g., 3600s).

  3.  **The "Component" that Solved It**: The **Client Manifest** (`.output/server/chunks/app/client.manifest.mjs`).
      - **Problem (SSG/Prerender)**: When using `prerender: true`, Nuxt reads the Manifest _at build time_ and hardcodes the asset hashes (e.g., `<script src="/_nuxt/Hero.abc123.js">`) into static `.html` files. If the user caches this HTML, they are locked into looking for `.abc123.js` forever, even if a new deployment deletes it.
      - **Solution (ISR)**: With `swr: true`, the HTML is generated _at runtime_ by the Lambda. The Lambda loads the **latest** Manifest from the _current_ atomic deployment bundle. It says "Oh, the Hero component is now `Hero.xyz987.js`", and generates HTML pointing to the valid, existing file.
  4.  **Invalidation Mechanic**:
      - By switching to ISR, we changed the `Cache-Control` header from "Immutable Static Asset" to `s-maxage=3600, stale-while-revalidate`.
      - This tells the CDN: "You can serve a stale version if you have it, but please go ask the Lambda for a new one in the background."
      - The Lambda, running the _new_ code, generates the _correct_ HTML with fresh asset links, healing the "Split-Brain" automatically.

### 2. TypeScript Undefined in `.split()` Chain

- **Error**: `Object is possibly 'undefined'` on variables like `startStr` derived from `getTime()?.toISOString().split('T')[0]`.
- **Cause**: TypeScript strictly enforces that `.toISOString()` or `.split()` results _might_ be undefined/null in complex chains, even if logically safe.
- **Lesson**: Use nullish coalescing (`?? ''`) when transforming potentially undefined string results to ensure a stable fallback type usually required for comparison logic.
- **Fix**: Added `?? ''` fallback: `const startStr = start.toISOString().split('T')[0] ?? ''`.

### 3. Nuxt Build: TSConfig Race Condition Error

- **Error**: `TSConfckParseError: [vite:esbuild] parsing .../tsconfig.server.json failed: ENOENT`
- **Cause**: Race condition between Vite's TS plugin reading config files and Nuxt regenerating them after a `rm -rf .nuxt` cleanup.
- **Lesson**: Vite tries to parse TS config before Nuxt has finished generating it. This only happens immediately after deleting the `.nuxt` folder.
- **Fix**: Re-run the build (`pnpm build`) or run `nuxt prepare` first (`pnpm nuxt prepare && pnpm build`).

### 4. Nuxt Build: Minification TDZ (Temporal Dead Zone) Error

- **Error**: `Uncaught ReferenceError: Cannot access 'ne' before initialization` (or `y`, `isFunction`, etc.) in production builds.
- **Cause**: Variable shadowing/collision between Vue runtime utilities and MDC parser (from `@nuxt/content`) when using aggressive `manualChunks`. The minifier creates collisions that hoisting fails to resolve, leading to TDZ access.
- **Lesson**: Aggressive manual chunking with minification can break initialization order for internal runtime helpers.
- **Fix**: Disable minification (`minify: false` in `nuxt.config.ts`) or simplify/remove `manualChunks` strategy. Vercel's Brotli/Gzip compression mitigates the bundle size impact.

### 5. Unused Preload Warnings with NuxtImg

- **Error**: "The resource ... was preloaded using link preload but not used within a few seconds..." plus potential 404s if the asset path is strictly handled.
- **Cause**: Manually preloading an image in `nuxt.config.ts` (e.g., `/image.webp`) while using `<NuxtImg>` in the template. `<NuxtImg>` generates an optimized IPX URL (e.g., `/_ipx/...`), so the browser downloads the optimized version and ignores the preloaded raw file.
- **Lesson**: Do not manually preload raw assets that are processed by image optimization modules.
- **Fix**: Remove manual `<link rel="preload">` tags. Use `loading="eager"` and `fetchpriority="high"` attributes on the `<NuxtImg>` component instead.
