import { queryCollection } from '@nuxt/content/server'
import { canonicalUrl, escapeXml } from '../utils/feed'
import bookmarks from '../../content/bookmarks.json'

export default defineEventHandler(async (event) => {
  const [articles, shayris] = await Promise.all([
    queryCollection(event, 'articles').select('path', 'date').all(),
    queryCollection(event, 'shayris').select('path', 'date').all()
  ])
  const staticRoutes = useRuntimeConfig(event).siteStaticRoutes as string[]
  const routes = new Map<string, string | undefined>()

  for (const route of staticRoutes) {
    if (!shayris.length && route.startsWith('/shayris/')) continue
    if (!bookmarks.length && route === '/bookmarks/') continue
    routes.set(canonicalUrl(route), undefined)
  }
  for (const page of [...articles, ...shayris]) {
    const date = new Date(page.date)
    routes.set(canonicalUrl(page.path), Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10))
  }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...routes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([url, date]) => `  <url><loc>${escapeXml(url)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`
})
