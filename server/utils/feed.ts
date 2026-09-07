export const siteUrl = 'https://www.arhmn.sh'

export function canonicalUrl(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || '/'
  return `${siteUrl}${pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`}`
}

export function escapeXml(value: unknown): string {
  return String(value ?? '').replace(/[<>&"']/g, character => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  })[character]!)
}
