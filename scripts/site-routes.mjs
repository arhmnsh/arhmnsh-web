import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const siteUrl = 'https://www.arhmn.sh'
export const projectRoot = fileURLToPath(new URL('../', import.meta.url))

export function normalizeRoute(route) {
  const pathname = route.split(/[?#]/, 1)[0].replace(/\/{2,}/g, '/')
  const trimmedPath = pathname.replace(/^\/+|\/+$/g, '')
  return trimmedPath ? `/${trimmedPath}/` : '/'
}

export function canonicalUrl(route) {
  return `${siteUrl}${normalizeRoute(route)}`
}

function findFiles(directory, extension) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? findFiles(file, extension) : file.endsWith(extension) ? [file] : []
  }).sort()
}

export function getStaticPageRoutes(root = projectRoot) {
  const pagesDirectory = path.join(root, 'app/pages')
  return [...new Set(findFiles(pagesDirectory, '.vue')
    .map(file => path.relative(pagesDirectory, file).replace(/\\/g, '/'))
    .filter(file => !file.includes('['))
    .map(file => normalizeRoute(file.replace(/\.vue$/, '').replace(/(^|\/)index$/, ''))))]
}

export function getContentPages(root = projectRoot) {
  const contentDirectory = path.join(root, 'content')
  return ['articles', 'shayris'].flatMap(collection =>
    findFiles(path.join(contentDirectory, collection), '.md').map(file => ({
      collection,
      file,
      route: normalizeRoute(path.relative(contentDirectory, file).replace(/\\/g, '/').replace(/\.md$/, '').replace(/\/index$/, ''))
    }))
  )
}

// Content links can be hidden by filters or JavaScript. Discover their routes
// directly so every published document has an HTML file on static hosting.
export function getPrerenderRoutes(root = projectRoot) {
  return [...new Set([...getStaticPageRoutes(root), ...getContentPages(root).map(page => page.route)])].sort()
}
