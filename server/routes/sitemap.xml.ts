import { Feed } from 'feed'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = 'https://ofriperetz.dev'

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/projects', changefreq: 'weekly', priority: 0.8 },
    { url: '/articles', changefreq: 'daily', priority: 0.9 },
    { url: '/stats', changefreq: 'weekly', priority: 0.6 }
  ]

  const lastmod = new Date().toISOString()

  const urls = staticPages.map(page => `
    <url>
      <loc>${siteUrl}${page.url}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  return sitemap
})
