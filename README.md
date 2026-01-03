# ofriperetz.dev

Personal portfolio and blog website for **Ofri Peretz** - Engineering Leader & Open Source Creator.

Built with [Nuxt UI](https://ui.nuxt.com) and [Nuxt Content](https://content.nuxt.com).

## 🚀 Features

- **SEO & AEO Optimized**: Structured data (JSON-LD), Open Graph, Twitter Cards
- **Markdown-Based Content**: Easy to update blog posts and projects
- **Dark/Light Mode**: Automatic theme switching
- **Fast Performance**: SSG with Nuxt 4
- **Social Sharing**: Rich previews when shared on X, LinkedIn, etc.

## 🛠️ Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com)
- **UI**: [Nuxt UI](https://ui.nuxt.com)
- **Content**: [Nuxt Content](https://content.nuxt.com)
- **Hosting**: [Vercel](https://vercel.com) / [Netlify](https://netlify.com)
- **OG Images**: [nuxt-og-image](https://nuxtseo.com/og-image)

## 📁 Content Structure

```
content/
├── index.yml           # Homepage content
├── about.yml           # About page
├── projects.yml        # Projects page header
├── projects/           # Individual project files
│   ├── eslint-plugin-secure-coding.yml
│   └── ...
├── blog.yml            # Blog page header
├── blog/               # Blog posts (Markdown)
│   ├── ai-native-eslint-plugins.md
│   └── ...
└── speaking.yml        # Articles & Writing
```

## 🚀 Quick Start

### Setup

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm build
pnpm preview
```

## 📝 Adding Content

### New Blog Post

Create a new file in `content/blog/`:

```markdown
---
title: "Your Post Title"
description: "Brief description"
date: "2024-01-01"
image: https://your-image-url.com
tags:
  - Tag1
  - Tag2
---

Your content here...
```

### New Project

Create a new file in `content/projects/`:

```yaml
title: "Project Name"
description: "What this project does"
image: https://your-image-url.com
url: "https://link-to-project.com"
tags: ["Tag1", "Tag2"]
date: "2024"
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Deploy!

### Netlify

1. Push to GitHub
2. Import project on [Netlify](https://app.netlify.com/start)
3. Build command: `pnpm build`
4. Publish directory: `.output/public`

## 📄 License

MIT License - Feel free to use this as a template for your own portfolio!

---

Built with ❤️ by [Ofri Peretz](https://github.com/ofri-peretz)
