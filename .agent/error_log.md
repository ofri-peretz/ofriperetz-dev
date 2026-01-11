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
- **Fix (The "Pure SSR + Safety Net" Strategy)**:
  1.  **Enforce Pure SSR**: In `nuxt.config.ts`, set explicit rules to disable caching and styling for main routes. This forces Vercel to execute the lambda on _every_ request, guaranteeing the HTML is generated using the _current_ build processing.

  ```typescript
  routeRules: {
    '/': { ssr: true, prerender: false, swr: false },
    '/projects': { ssr: true, prerender: false, swr: false }
  }
  ```

  2.  **Why SSR over ISR?**: In some edge cases, Vercel may cache a 404 response from a failed ISR revalidation (caused by a temporary mismatch or cold start). Pure SSR bypasses the shared cache completely for the HTML document, ensuring the user always gets a fresh response or an immediate error (which can be retried).

  3.  **Safety Net (Client Plugin)**: Added `chunk-error-handler.client.ts`. Is a lightweight plugin that listens for `ChunkLoadError`. If a user _does_ somehow get stale HTML (e.g., from their own aggressive browser cache), and a JS chunk fails to load (404), this plugin automatically triggers a `window.location.reload()` (once) to fetch the fresh document.
  4.  **Result**:
      - Server: Always serves fresh HTML (SSR).
      - Client: Automatically self-heals if it hits a dead-end asset.

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

### 6. Deployment Rejection masking Fixes

- **Error**: Fixes applied (like switching to SSR) don't seem to work; site remains broken/cached.
- **Cause**: Syntax errors in `nuxt.config.ts` (e.g., missing braces) caused the build to fail. Vercel automatically rolls back (or stays on) the previous deployment, so the broken state persists.
- **Lesson**: If a deployment doesn't fix the issue, check the build logs. A rejected build means the new configuration was never applied.
- **Fix**: Always validate config syntax locally (e.g., `pnpm nuxi typecheck` or just `pnpm dev`) before pushing critical infrastructure changes.

### 7. Comprehensive Diagnostics & Elimination Report (2026-01-11)

- **Asset Integrity**: Verified `ofri-profile.webp` returns **200 OK** via direct curl. Static assets are correctly hosted.
- **Route Availability (The Trade-Off)**: Pure SSR consistently resulted in 404s for root routes on Vercel (likely due to Nitro preset function mapping conflicts).
- **Resolution**: RESTORED **Prerendering** (`prerender: true`) for main routes to guarantee **200 OK** availability.
- **Split-Brain Mitigation**: Retained the `chunk-error-handler.client.ts` plugin. Since Prerendering re-introduces the race condition risk, this client-side safety net is now critical to auto-recover any sessions that hit stale HTML.
