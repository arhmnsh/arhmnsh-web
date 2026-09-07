type DateInput = string | number | Date | null | undefined

function parseDate(value: DateInput): Date | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

// Content dates are calendar dates. Always format in UTC so server rendering
// and readers in different time zones display the same publication day.
export function formatDate(value: DateInput, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }): string {
  const date = parseDate(value)
  return date ? new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date) : ''
}

export function dateTime(value: DateInput): string {
  const date = parseDate(value)
  if (!date) return ''
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : date.toISOString()
}
