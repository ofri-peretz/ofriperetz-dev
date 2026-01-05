# AGENTS.md

> Context for AI coding agents working on the ofriperetz.dev personal brand website

## Project Overview

This is a **Nuxt 4** personal portfolio and blog site for Ofri Peretz.

| Directory  | Purpose                                      |
| ---------- | -------------------------------------------- |
| `app/`     | Vue components and pages                     |
| `content/` | Nuxt Content markdown files                  |
| `public/`  | Static assets (images, robots.txt, llms.txt) |
| `server/`  | Server routes and API endpoints              |

## Setup Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Code Style

- TypeScript with Vue 3 Composition API
- Use `<script setup lang="ts">` for components
- Follow Nuxt ESLint config (`@nuxt/eslint`)
- CSS: TailwindCSS via `@nuxt/ui`
- Motion: Use `motion-v/nuxt` for animations
- Images: Use `@nuxt/image` for optimization

## Project Structure

```
app/
├── components/        # Reusable Vue components
├── composables/       # Vue composables
├── layouts/           # Page layouts
├── pages/             # Route pages
└── utils/             # Utility functions

content/
└── *.md              # Blog posts and content

server/
├── api/              # API routes
└── routes/           # Server routes

public/
├── robots.txt        # Web crawler configuration
├── llms.txt          # LLM context file
└── *.png             # Static images
```

## Key Pages

- `/` - Home page with hero and projects showcase
- `/about` - Personal bio and experience
- `/projects` - Open source projects gallery
- `/articles` - Dev.to articles mirror with pagination
- `/stats` - Live GitHub/npm statistics dashboard

## Development Guidelines

1. **SEO/AEO Focus**: All pages must have proper meta tags and structured data
2. **Motion Design**: Use smooth transitions and micro-animations
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Performance**: Optimize images, lazy load below-the-fold content
5. **UTM Tracking**: All outbound links use UTM parameters

## Environment Variables

| Variable        | Purpose                              |
| --------------- | ------------------------------------ |
| `DEVTO_API_KEY` | Dev.to API access (server-side only) |
| `GITHUB_TOKEN`  | GitHub API access (server-side only) |

## Testing Before Commit

1. Run `pnpm dev` and verify all pages load
2. Check console for errors
3. Verify responsive design (mobile/tablet/desktop)
4. Ensure all links have UTM parameters

## AI Configuration Files

This site includes modern AI/LLM configuration:

- `public/robots.txt` - Web crawler and AI bot permissions
- `public/llms.txt` - Structured context for LLMs
- `AGENTS.md` - This file, for AI coding assistants
