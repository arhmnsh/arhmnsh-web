/** The sections of the site: one is open under the name, the rest wait in the tab bar. Introduction lives at the root. */
export interface Section {
  id: 'intro' | 'work' | 'writing' | 'books' | 'photos' | 'poetry' | 'bookmarks'
  title: string
  path: string
  tagline: string
}

export const sections: Section[] = [
  { id: 'intro', title: 'Introduction', path: '/', tagline: 'Engineer and designer in Riyadh' },
  { id: 'work', title: 'Work', path: '/work', tagline: 'AI products for airports and cities' },
  { id: 'writing', title: 'Writing', path: '/articles', tagline: 'Notes on software, AI, and making things' },
  { id: 'books', title: 'Books', path: '/books', tagline: 'A shelf, with a note on every book' },
  { id: 'photos', title: 'Photos', path: '/gallery', tagline: 'Places, people, and the view from above' },
  { id: 'poetry', title: 'Poetry', path: '/shayris', tagline: 'Urdu poems with word meanings' },
  { id: 'bookmarks', title: 'Bookmarks', path: '/bookmarks', tagline: 'Links worth keeping' }
]

export function sectionFor(path: string): Section | undefined {
  const clean = path.replace(/\/+$/, '') || '/'
  return sections.find(section => clean === section.path || (section.path !== '/' && clean.startsWith(section.path + '/')))
}
