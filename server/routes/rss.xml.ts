import { queryCollection } from '@nuxt/content/server'
import { canonicalUrl, escapeXml, siteUrl } from '../utils/feed'

export default defineEventHandler(async (event) => {
  const articles = await queryCollection(event, 'articles').order('date', 'DESC').all()
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')

  const items = articles.map(article => {
    const url = escapeXml(canonicalUrl(article.path))
    const date = new Date(article.date)
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(article.description)}</description>
      ${Number.isNaN(date.getTime()) ? '' : `<pubDate>${date.toUTCString()}</pubDate>`}
      ${(article.categories || []).map(category => `<category>${escapeXml(category)}</category>`).join('\n      ')}
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AbdurRahaman Shah — Articles</title>
    <link>${siteUrl}/articles/</link>
    <description>Writing on product engineering, AI, and learning by AbdurRahaman Shah.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
})
