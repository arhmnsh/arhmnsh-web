export function filterValues(value: unknown): string[] {
  return [...new Set((Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === 'string' && item.length > 0))]
}

export function matchesPoetry(poem: { author: string, tags: string[] }, authors: string[], tags: string[]) {
  return (!authors.length || authors.some(author => author.toLowerCase() === poem.author.toLowerCase())) &&
    (!tags.length || poem.tags.some(tag => tags.some(selected => selected.toLowerCase() === tag.toLowerCase())))
}
