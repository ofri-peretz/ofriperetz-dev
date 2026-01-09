# Nuxt Build: Minification TDZ (Temporal Dead Zone) Error

## Error Message

```
Uncaught ReferenceError: Cannot access 'ne' before initialization
Uncaught ReferenceError: Cannot access 'y' before initialization
Uncaught ReferenceError: Cannot access 'isFunction' before initialization
```

## Diagnostic Signs (How to Identify This Issue)

✅ **This IS the minification TDZ error if:**

- Error mentions `Cannot access 'X' before initialization` where X is a short variable name like `ne`, `y`, `I`, `K`, `j`, `as`, or `isFunction`
- Error occurs in **production builds** (minified bundles) but NOT in development
- Error happens **consistently** on every build, even after `nuxt prepare`
- Error occurs at **runtime in the browser**, not during the build process
- The error references a minified bundle file (e.g., `BsAqSnzo.js:1:30683`)
- You're using **aggressive `manualChunks`** in your Vite/Nuxt config
- You're using **`@nuxt/content`** (which includes MDC parser)

❌ **This is NOT the minification TDZ error if:**

- Error mentions `TSConfckParseError` or `[vite:esbuild]` → This is a **TSConfig race condition**
- Error happens during the **build phase** (not runtime in browser)
- Error references `.nuxt/tsconfig.*.json` files
- Re-running the build fixes the issue → This is a **race condition**

## When It Happens

This error occurs when:

1. You have **minification enabled** (`minify: 'esbuild'` or `minify: 'terser'`)
2. You're using **aggressive manual chunking** to split vendor libraries
3. The minifier creates **variable name collisions** between different modules

### Root Cause

This is a **variable shadowing/collision** issue in minified bundles:

1. **Vue Runtime Utilities**: Vue's internal functions like `isFunction`, `isObject`, `isPromise` get minified to short names (e.g., `ne`, `y`, `I`)
2. **MDC Parser Variables**: `@nuxt/content`'s Markdown Components parser also has local functions that get minified to the same short names
3. **Aggressive Chunking**: When you use `manualChunks` to split these into separate bundles, the bundler may combine scopes incorrectly
4. **Initialization Order**: The minified code tries to access a variable before it's defined, triggering the TDZ error

**Example from production:**

```javascript
// In bundle BsAqSnzo.js, the minifier created 8 separate declarations of 'ne'
// Vue's isFunction: ne=e=>typeof e==="function"
// MDC parser's ne: function ne() { ... }
// When accessed before initialization: ReferenceError!
```

## Solution

### Primary Fix: Disable Minification

The most reliable solution is to **disable minification** in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      // Disable minification to prevent TDZ errors
      minify: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Your chunking strategy...
          },
        },
      },
    },
  },
});
```

**Trade-offs:**

- ✅ **Pros**: Deterministic initialization, no runtime errors
- ⚠️ **Cons**: ~15% larger bundle size (~5MB increase)
- ✅ **Mitigation**: Vercel's edge Brotli/Gzip compression still provides excellent optimization

### Alternative Fix: Simplify Manual Chunking

If you want to keep minification enabled, simplify or remove your `manualChunks` strategy:

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      minify: "esbuild",
      rollupOptions: {
        output: {
          // Remove or simplify manualChunks
          // Let Vite handle chunking automatically
        },
      },
    },
  },
});
```

### Partial Fix: Disable Identifier Mangling Only

**⚠️ Warning**: This approach was tested and **did NOT work** for this specific issue. The error transformed from `ne` to `isFunction`, indicating that reordering/hoisting within the minification pass itself was the trigger.

```typescript
// NOT RECOMMENDED - Included for completeness
export default defineNuxtConfig({
  vite: {
    build: {
      minify: "esbuild",
      esbuild: {
        minifyIdentifiers: false,
      },
    },
  },
});
```

## Vercel Cleanup & Cache Purging

When deploying the fix to Vercel, you may need to **clear build caches** to ensure the new configuration takes effect.

### Option 1: Force Deploy via CLI (Recommended)

This bypasses all build caches and forces a fresh build:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Force a production deployment (bypasses cache)
npx vercel --prod --force
```

### Option 2: Vercel Dashboard Cache Purge

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (e.g., `ofriperetz-dev`)
3. Go to **Settings** → **General**
4. Scroll to **Build & Development Settings**
5. Click **Clear Build Cache**
6. Trigger a new deployment (push to main or click **Redeploy**)

### Option 3: Git-Based Deployment with Cache Bypass

If you've already pushed your fix but the error persists:

```bash
# Create an empty commit to trigger a fresh build
git commit --allow-empty -m "chore: trigger fresh Vercel build"
git push
```

Then in Vercel Dashboard:

1. Go to your latest deployment
2. Click the **⋯** menu
3. Select **Redeploy**
4. ✅ **Check "Use existing Build Cache"** = **OFF**

### Option 4: Nuclear Option (Complete Reset)

If the issue persists after the above steps, perform a complete local and remote reset:

```bash
# 1. Purge all local state
rm -rf .vercel .nuxt .output .data node_modules/.cache node_modules/.vite

# 2. Re-link to the correct Vercel project
npx vercel link --project ofriperetz-dev --yes

# 3. Pull latest project settings
npx vercel pull --yes

# 4. Build locally (ensures clean state)
pnpm install
pnpm nuxt prepare
pnpm build

# 5. Deploy with prebuilt artifacts (bypasses Vercel's build)
npx vercel deploy --prebuilt --prod --archive=tgz
```

## Verification

After deploying the fix:

1. **Check Build Logs**: Verify that minification is disabled (or chunking is simplified)
2. **Test in Browser**: Open your production site and check the console for errors
3. **Verify Bundle Names**: The error should no longer appear in any `_nuxt/*.js` files
4. **Check Bundle Size**: Expect a ~15% increase if you disabled minification (this is normal)

## Prevention

To avoid this issue in the future:

1. **Be cautious with `manualChunks`**: Aggressive chunking can create initialization order issues
2. **Test production builds locally**: Run `pnpm build && pnpm preview` before deploying
3. **Monitor bundle analysis**: Use `npx vite-bundle-visualizer` to understand chunk dependencies
4. **Consider the trade-off**: Minification saves ~15% bundle size but can introduce subtle runtime errors

## Related Issues

- [Nuxt Deployment Integrity](../knowledge/deployment_integrity.md) - Section 1.7 & 1.8
- [TSConfig Race Condition](./nuxt-tsconfig-race-condition.md) - Different issue with similar symptoms during build

## See Also

- [Vite Minification Options](https://vitejs.dev/config/build-options.html#build-minify)
- [Rollup Manual Chunks](https://rollupjs.org/configuration-options/#output-manualchunks)
- [Vercel Build Cache Documentation](https://vercel.com/docs/concepts/deployments/build-cache)

---

_Last updated: 2026-01-09_
