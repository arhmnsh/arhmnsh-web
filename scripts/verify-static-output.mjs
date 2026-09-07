import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { canonicalUrl, getContentPages, getPrerenderRoutes, projectRoot, siteUrl } from './site-routes.mjs'

const outputDirectory = path.join(projectRoot, '.output/public')
const baseUrlIndex = process.argv.indexOf('--base-url')
const baseUrl = baseUrlIndex === -1 ? undefined : process.argv[baseUrlIndex + 1]
if (baseUrlIndex !== -1 && !baseUrl) throw new Error('--base-url requires the URL of a static preview server')
const failures = []
const contentPages = getContentPages()
const routes = getPrerenderRoutes()

function decodeEntities(value) {
  return value.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[name])
}

function attribute(tag, name) {
  const value = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'i'))?.[2]
  return value === undefined ? undefined : decodeEntities(value)
}

function textContent(html) {
  return decodeEntities(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function tokens(value) {
  return value.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(' ') || ''
}

function markdownStart(markdown) {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim()
  const paragraph = body.split(/\r?\n\s*\r?\n/).find(block => !/^\s*(#|>|```|!?\[|<)/.test(block)) || ''
  return paragraph.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '').replace(/[*_`]/g, '')
}

function markdownTitle(markdown) {
  const raw = markdown.match(/^title:\s*(.+)$/m)?.[1]?.trim() || ''
  if (raw.startsWith('"')) return JSON.parse(raw)
  return raw.replace(/^'|'$/g, '').replace(/''/g, "'")
}

async function check(label, callback) {
  try {
    await callback()
  } catch (error) {
    failures.push(`${label}: ${error.message}`)
  }
}

const renderedPages = new Map()
for (const route of routes) {
  await check(route, async () => {
    // Directory index files are what GitHub Pages serves for a fresh URL.
    // A generic 200.html/404.html client shell does not satisfy this check.
    const file = path.join(outputDirectory, route, 'index.html')
    const html = await readFile(file, 'utf8')
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
    const title = textContent(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
    assert(title && !/^404\b/.test(title), 'missing page title or generated a 404 shell')
    const canonicals = [...head.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).filter(tag => attribute(tag, 'rel') === 'canonical')
    assert.equal(canonicals.length, 1, 'expected exactly one canonical link')
    assert.equal(attribute(canonicals[0], 'href'), canonicalUrl(route), 'incorrect canonical URL')
    const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0])
    const meta = name => metas.find(tag => attribute(tag, 'name') === name || attribute(tag, 'property') === name)
    for (const name of ['description', 'og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
      assert(attribute(meta(name) || '', 'content'), `missing ${name} metadata`)
    }
    assert.equal(attribute(meta('og:url'), 'content'), canonicalUrl(route), 'incorrect Open Graph URL')
    const imageUrl = new URL(attribute(meta('og:image'), 'content'))
    if (imageUrl.origin === siteUrl) await access(path.join(outputDirectory, decodeURIComponent(imageUrl.pathname)))
    const visibleText = textContent(html)
    // Check the entry scripts and preloaded chunks as well as the HTML shell.
    for (const tag of html.match(/<(?:script|link)\b[^>]*>/gi) || []) {
      const asset = attribute(tag, 'src') || attribute(tag, 'href')
      if (asset?.startsWith('/_nuxt/')) await access(path.join(outputDirectory, asset.split('?')[0]))
    }
    assert(!/\b(Article not found|Page not found)\b/i.test(visibleText), 'generated an error page')
    renderedPages.set(route, { html, title, noindex: /\bnoindex\b/.test(attribute(meta('robots') || '', 'content') || '') })

    const contentPage = contentPages.find(page => page.route === route)
    if (contentPage) {
      const markdown = await readFile(contentPage.file, 'utf8')
      const expectedTitle = markdownTitle(markdown)
      assert(title.includes(expectedTitle), 'page title does not contain the content title')
      const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''
      assert.equal(tokens(textContent(heading)), tokens(expectedTitle), 'missing rendered content heading')
      const openingWords = tokens(markdownStart(markdown)).split(' ').slice(0, 20).join(' ')
      assert(openingWords.length > 20, 'could not identify opening content text')
      assert(tokens(visibleText).includes(openingWords), 'content text is missing from server-rendered HTML')
      if (contentPage.collection === 'articles') {
        assert.equal(attribute(meta('og:type'), 'content'), 'article', 'missing article Open Graph type')
        assert(attribute(meta('article:published_time') || '', 'content'), 'missing article publication date')
      }
    }

    if (baseUrl) {
      const response = await fetch(new URL(route, baseUrl), { redirect: 'follow' })
      assert.equal(response.status, 200, `fresh HTTP request returned ${response.status}`)
      assert.equal(await response.text(), html, 'HTTP response differs from the page HTML (possibly a fallback shell)')
      if (route !== '/') {
        const withoutSlash = await fetch(new URL(route.slice(0, -1), baseUrl), { redirect: 'follow' })
        assert.equal(withoutSlash.status, 200, 'slashless URL does not resolve')
        assert.equal(await withoutSlash.text(), html, 'slashless URL serves a different page')
      }
      if (route.startsWith('/articles/')) {
        const filtered = await fetch(new URL(`${route}?c=Personal`, baseUrl))
        assert.equal(filtered.status, 200, 'filtered fresh URL does not resolve')
        assert.equal(await filtered.text(), html, 'query string must serve the same static HTML')
      }
    }
  })
}

await check('sitemap.xml', async () => {
  const sitemap = await readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8')
  assert(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') && sitemap.includes('</urlset>'), 'invalid sitemap document')
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decodeEntities(match[1]))
  assert.equal(new Set(locations).size, locations.length, 'duplicate sitemap entries')
  for (const [route, page] of renderedPages) {
    assert.equal(locations.includes(canonicalUrl(route)), !page.noindex, page.noindex ? `${route} should be excluded` : `${route} is missing`)
  }
  for (const location of locations) {
    const url = new URL(location)
    assert.equal(url.origin, siteUrl, 'sitemap uses a different hostname')
    assert(!url.search && !url.hash && url.pathname.endsWith('/'), 'sitemap URL has query/hash or lacks its trailing slash')
    assert(renderedPages.has(url.pathname), `sitemap points to an unverified page: ${url.pathname}`)
  }
})

await check('rss.xml', async () => {
  const rss = await readFile(path.join(outputDirectory, 'rss.xml'), 'utf8')
  assert(rss.includes('<rss version="2.0"') && rss.includes('</rss>'), 'invalid RSS document')
  const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => match[1])
  const articles = contentPages.filter(page => page.collection === 'articles')
  assert.equal(items.length, articles.length, 'RSS item count differs from published articles')
  for (const article of articles) {
    const item = items.find(item => item.includes(`<link>${canonicalUrl(article.route)}</link>`))
    assert(item, `${article.route} is missing from RSS`)
    assert(item.includes('<pubDate>'), `${article.route} is missing its publication date`)
    assert(item.includes('<description>'), `${article.route} is missing its description`)
  }
})

await check('robots.txt', async () => {
  const robots = await readFile(path.join(outputDirectory, 'robots.txt'), 'utf8')
  assert(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt does not advertise the sitemap')
})

if (failures.length) {
  console.error(`Static verification failed (${failures.length}):\n${failures.map(failure => `- ${failure}`).join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Verified ${routes.length} prerendered pages, including ${contentPages.filter(page => page.collection === 'articles').length} complete articles, page metadata, social images, sitemap, RSS, and robots.txt${baseUrl ? ', plus fresh HTTP requests' : ''}.`)
}
