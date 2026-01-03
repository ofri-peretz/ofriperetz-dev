---
title: "OWASP Top 10 2021: Complete ESLint Coverage"
description: "How to catch all OWASP Top 10 vulnerabilities at the static analysis layer with eslint-plugin-secure-coding."
date: "2024-10-20"
image: https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1470&auto=format&fit=crop
authors:
  - name: Ofri Peretz
    avatar:
      src: https://avatars.githubusercontent.com/u/ofri-peretz
    to: https://github.com/ofri-peretz
tags:
  - Security
  - OWASP
  - ESLint
---

Security vulnerabilities are cheaper to fix the earlier they're caught. The OWASP Top 10 represents the most critical web application security risks, and with `eslint-plugin-secure-coding`, you can catch many of these at the static analysis layer.

## Coverage Breakdown

### A01:2021 - Broken Access Control

- `no-unsafe-access-control`
- `require-authorization-check`

### A02:2021 - Cryptographic Failures

- `no-weak-crypto`
- `no-hardcoded-secrets`
- `require-secure-random`

### A03:2021 - Injection

- `no-sql-injection`
- `no-command-injection`
- `no-eval`

_And 80+ more rules covering the complete OWASP Top 10..._

## Getting Started

```bash
npm install eslint-plugin-secure-coding
```

Security shouldn't be an afterthought. Make it part of your development workflow.
