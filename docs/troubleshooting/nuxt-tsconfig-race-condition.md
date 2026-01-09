# Nuxt Build: TSConfig Race Condition Error

## Error Message

```
TSConfckParseError: [vite:esbuild] parsing /path/to/.nuxt/tsconfig.server.json failed:
Error: ENOENT: no such file or directory, open '/path/to/.nuxt/tsconfig.server.json'
```

## Diagnostic Signs (How to Identify This Issue)

✅ **This IS the tsconfig race condition if:**

- Error mentions `TSConfckParseError` or `[vite:esbuild]`
- Error references `.nuxt/tsconfig.server.json` (or other `.nuxt/tsconfig.*.json` files)
- Error is `ENOENT: no such file or directory`
- You recently ran `rm -rf .nuxt` or deleted the `.nuxt` directory
- The file referenced in the error (e.g., `app/utils/links.ts`) is a random TypeScript file, NOT the actual problem
- **Re-running the build succeeds**

❌ **This is NOT the tsconfig race condition if:**

- Error mentions `Cannot access 'X' before initialization` → This is a **minification TDZ error**
- Error happens consistently on every build, even after `nuxt prepare`
- Error references actual code issues or syntax errors
- Error mentions `mdc-imports.mjs` with Nuxt Content → May be related but different issue

## When It Happens

This error occurs when running `pnpm build` **immediately after** deleting the `.nuxt` directory (e.g., `rm -rf .nuxt .output && pnpm build`).

### Root Cause

This is a **race condition** between:

1. **Vite's TypeScript plugin** (via `vite:esbuild`) trying to read TypeScript configuration files
2. **Nuxt's build preparation** which regenerates the `.nuxt/tsconfig.*.json` files

When the build starts, Vite may attempt to parse TypeScript files before Nuxt has fully regenerated the tsconfig files in `.nuxt/`.

## Solution

### Quick Fix: Run the Build Again

Simply re-running the build usually works because the `.nuxt` directory is now populated:

```bash
pnpm build
```

### Recommended Fix: Run `nuxt prepare` First

For a more reliable build, run `nuxt prepare` before building:

```bash
pnpm nuxt prepare && pnpm build
```

This ensures all tsconfig files are generated before the build starts.

### One-Liner for Clean Builds

```bash
rm -rf .nuxt .output && pnpm nuxt prepare && pnpm build
```

## Prevention

A `build:clean` script is available in `package.json` for local development:

```bash
pnpm build:clean
```

This script ensures the same build pattern as Vercel (prepare → build) for consistent local builds.

## Related GitHub Issues & Discussions

- [nuxt/nuxt #30370](https://github.com/nuxt/nuxt/issues/30370) - TSConfckParseError during programmatic builds
- [nuxt/nuxt #25208](https://github.com/nuxt/nuxt/issues/25208) - ENOENT errors with tsconfig references
- [nuxt/content #2892](https://github.com/nuxt/content/issues/2892) - Related mdc-imports.mjs ENOENT with Nuxt Content

## See Also

- [Nuxt TypeScript Configuration Docs](https://nuxt.com/docs/guide/concepts/typescript)
- For **minification TDZ errors** (`Cannot access 'X' before initialization`), see the separate minification troubleshooting guide

---

_Last updated: 2026-01-09_
