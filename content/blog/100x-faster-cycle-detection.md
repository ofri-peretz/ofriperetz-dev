---
title: "100x Faster Cycle Detection: Why I Built eslint-plugin-import-next"
description: "The story behind building a drop-in replacement for eslint-plugin-import with dramatically improved performance."
date: "2024-11-15"
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1470&auto=format&fit=crop
authors:
  - name: Ofri Peretz
    avatar:
      src: https://avatars.githubusercontent.com/u/ofri-peretz
    to: https://github.com/ofri-peretz
tags:
  - ESLint
  - Performance
  - Architecture
---

If you've worked on a large TypeScript monorepo, you've likely experienced the pain of `eslint-plugin-import`'s `no-cycle` rule. What should be a quick lint check becomes a multi-minute ordeal.

## The Performance Problem

The original `no-cycle` rule uses a naive graph traversal algorithm that becomes exponentially slower as your codebase grows. In our 25+ package Nx monorepo, a single lint run could take over 10 minutes.

## The Solution: Algorithm First

Rather than incremental improvements, we took a algorithmic approach:

1. **Memoized Graph Traversal**: Caching visited paths
2. **Early Termination**: Stopping as soon as a cycle is detected
3. **Parallel Processing**: Leveraging modern multi-core systems

The result? **100x faster** cycle detection in real-world codebases.

## Try It Today

```bash
npm install eslint-plugin-import-next
```

It's a drop-in replacement - just swap the plugin name and you're done.
