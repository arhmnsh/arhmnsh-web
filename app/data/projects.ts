export interface Project {
  name: string
  field: string
  description: string
  glyph: string
  notes: string[]
  href?: string
  /** A real screenshot path, once available. Nothing is rendered in its place until then. */
  image?: string
}

export const workProjects: Project[] = [
  { name: 'Baseer TMS', field: 'Aviation · Operations', glyph: '↗', description: 'Aircraft turnaround management with real-time event tracking and predictive analytics. Deployed at Riyadh Airport.', notes: ['Real-time events', 'Computer vision', 'Predictive analytics'] },
  { name: 'Baseer Builder', field: 'AI · No-code', glyph: '⌘', description: 'A no-code and low-code platform for building AI use cases. Deployed at Eastern Province Municipality in Dammam.', notes: ['Visual pipelines', 'Low-code extensions', 'Model deployment'] },
  { name: 'Baseer GPT', field: 'AI · Knowledge', glyph: '✳', description: 'An internal knowledge platform with retrieval-augmented generation, contextual conversations, and semantic search.', notes: ['Retrieval-augmented generation', 'Semantic search'] },
  { name: 'Baseer STT', field: 'Language · Speech', glyph: '≋', description: 'Speech-to-text for local Arabic dialects, with speaker and sentiment analysis.', notes: ['Arabic dialects', 'Speaker analysis', 'Sentiment'] },
  { name: 'Altanfeethi', field: 'Aviation · Experience', glyph: '⌁', description: 'Passenger journey analytics for airport VIP terminals.', notes: ['Journey mapping', 'Experience analytics'] }
]

export const sideProjects: Project[] = [
  { name: 'Salaf Sayings', field: 'Side project', glyph: 'S', href: 'https://salafsayings.arhmn.sh', description: 'Sayings from the early generations, one at a time.', notes: [] },
  { name: 'Athkar', field: 'Side project', glyph: 'A', href: 'https://athkar.arhmn.sh', description: 'Daily remembrances, morning and evening.', notes: [] }
]
