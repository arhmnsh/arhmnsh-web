/** Extract visible text from Nuxt Content's compact or expanded Markdown trees. */
export function contentText(value: unknown): string {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return ''
  if (Array.isArray(value)) {
    const isElement = typeof value[0] === 'string' && value[1] !== null && typeof value[1] === 'object' && !Array.isArray(value[1])
    return (isElement ? value.slice(2) : value).map(contentText).join(' ')
  }
  const node = value as Record<string, unknown>
  if (node.type === 'text') return String(node.value || '')
  return contentText(node.children || node.value || '')
}
