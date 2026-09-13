<script setup lang="ts">
import { Search, ArrowRight, ArrowUpRight, BookOpen, Camera, Feather, FileText, Bookmark, CornerDownLeft, X } from 'lucide-vue-next'
import books from '../../content/books.json'
import bookmarks from '../../content/bookmarks.json'
import gallery from '../../content/gallery.json'
import { contentText } from '~/utils/contentText'

const { isOpen, close } = useCommandMenu()
const route = useRoute()
const query = ref('')
const input = ref<HTMLInputElement | null>(null)
const resultList = ref<HTMLElement | null>(null)
const expandedGroups = ref<string[]>([])
const { data, status, error, execute } = await useAsyncData('site-search-content', async () => {
  const [articles, shayris] = await Promise.all([
    queryCollection('articles').select('path', 'title', 'description', 'categories', 'body').all(),
    queryCollection('shayris').select('path', 'title', 'author', 'tags', 'body').all()
  ])
  return { articles, shayris }
}, { immediate: false, server: false, deep: false })

type SearchItem = { title: string, detail: string, href: string, text: string, external?: boolean }
const normalize = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
const destinations = [
  { name: 'Articles', detail: 'Ideas, explored', href: '/articles', icon: FileText },
  { name: 'Books', detail: 'From my bookshelf', href: '/books', icon: BookOpen },
  { name: 'Gallery', detail: 'Through my lens', href: '/gallery', icon: Camera },
  { name: 'Poetry', detail: 'Words that stay', href: '/shayris', icon: Feather }
]
const groupIcons: Record<string, typeof Search> = { Articles: FileText, Books: BookOpen, Gallery: Camera, Poetry: Feather, Bookmarks: Bookmark }
const groups = computed(() => {
  const collections: { name: string, items: SearchItem[] }[] = [
    { name: 'Articles', items: (data.value?.articles || []).map(a => ({ title: a.title, detail: a.description || a.categories.join(' · '), href: a.path, text: [a.title, a.description, a.categories.join(' '), contentText(a.body)].join(' ') })) },
    { name: 'Books', items: books.map(b => ({ title: b.title, detail: b.author, href: `/books?book=${encodeURIComponent(b.id)}`, text: [b.title, b.author, b.review].join(' ') })) },
    { name: 'Gallery', items: gallery.map(g => ({ title: g.title, detail: 'caption' in g ? String(g.caption) : 'alt' in g ? String(g.alt) : g.platform, href: `/gallery?media=${encodeURIComponent(g.id)}`, text: [g.title, 'caption' in g ? g.caption : '', 'alt' in g ? g.alt : ''].join(' ') })) },
    { name: 'Poetry', items: (data.value?.shayris || []).map(s => ({ title: s.title, detail: s.author, href: s.path, text: [s.title, s.author, s.tags.join(' '), contentText(s.body)].join(' ') })) },
    { name: 'Bookmarks', items: (bookmarks as Array<{ title: string, url: string, description?: string, tags: string[] }>).map(b => ({ title: b.title, detail: b.description || new URL(b.url).hostname, href: b.url, external: true, text: [b.title, b.url, b.description, b.tags.join(' ')].join(' ') })) }
  ]
  // Normalize the index once when data arrives, rather than on every keystroke.
  return collections.map(group => ({ ...group, items: group.items.map(item => ({ ...item, text: normalize(item.text), normalizedTitle: normalize(item.title) })) }))
})
const normalizedQuery = computed(() => normalize(query.value).trim())
const results = computed(() => {
  const terms = normalizedQuery.value.split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return groups.value.map(group => ({ ...group, items: group.items
    .filter(item => terms.every(term => item.text.includes(term)))
    .sort((a, b) => Number(b.normalizedTitle.includes(normalizedQuery.value)) - Number(a.normalizedTitle.includes(normalizedQuery.value)))
  })).filter(group => group.items.length)
})
const visibleResults = computed(() => results.value.map(group => ({
  ...group,
  total: group.items.length,
  items: expandedGroups.value.includes(group.name) ? group.items : group.items.slice(0, 6)
})))
const count = computed(() => results.value.reduce((total, group) => total + group.items.length, 0))
const searchStatus = computed(() => !query.value.trim()
  ? 'A title, a topic, a half-remembered thought.'
  : status.value === 'pending'
    ? 'Looking through the collection…'
    : `${count.value} ${count.value === 1 ? 'discovery' : 'discoveries'} for “${query.value.trim()}”`)

const focusResult = (index: number) => {
  const links = resultList.value?.querySelectorAll<HTMLElement>('[data-search-result]')
  if (!links?.length || index < 0) { input.value?.focus({ preventScroll: true }); return }
  links[Math.min(index, links.length - 1)]?.focus()
}
const openFirstResult = (event: KeyboardEvent) => {
  if (event.isComposing) return
  event.preventDefault()
  resultList.value?.querySelector<HTMLElement>('[data-search-result]')?.click()
}
const moveResult = (event: KeyboardEvent, direction: number) => {
  if (!(event.target instanceof HTMLElement) || !event.target.matches('[data-search-result]')) return
  event.preventDefault()
  const links = Array.from(resultList.value?.querySelectorAll<HTMLElement>('[data-search-result]') || [])
  focusResult(links.indexOf(event.target) + direction)
}
function clearSearch() {
  query.value = ''
  input.value?.focus({ preventScroll: true })
}
watch(query, () => { expandedGroups.value = [] })
watch(() => route.fullPath, close)
watch(isOpen, async value => {
  if (!import.meta.client) return
  if (value) {
    if (status.value === 'idle' || status.value === 'error') void execute()
    await nextTick()
    input.value?.focus({ preventScroll: true })
  } else query.value = ''
}, { immediate: true })
</script>

<template>
  <AccessibleDialog v-model:open="isOpen" title="Follow your curiosity." description="Search the writing, books, photographs, and poetry." close-label="Close search" class="search-dialog">
    <label for="site-search" class="sr-only">Search this site</label>
    <div class="search-field">
      <Search class="search-field-icon" :size="21" aria-hidden="true" />
      <input id="site-search" ref="input" v-model="query" type="search" autofocus autocomplete="off" spellcheck="false" placeholder="What’s on your mind?" aria-describedby="search-status" @keydown.down.prevent="focusResult(0)" @keydown.enter="openFirstResult" />
      <button v-if="query" type="button" class="search-clear" aria-label="Clear search" @click="clearSearch"><X :size="16" aria-hidden="true" /></button>
      <kbd v-else class="search-escape" aria-hidden="true">esc</kbd>
    </div>
    <p id="search-status" role="status" aria-live="polite" aria-atomic="true" class="search-status">{{ searchStatus }}</p>
    <p v-if="error" class="search-error">Writing and poetry could not be loaded. Books and photographs are still searchable. <button type="button" @click="execute()">Try again</button></p>
    <div v-if="query.trim() && !count && status !== 'pending'" class="search-empty">
      <span class="search-empty-icon"><Search :size="25" aria-hidden="true" /></span>
      <h3>Another way to find it.</h3>
      <p>Try fewer words, an author’s name, or a topic like design.</p>
      <button type="button" class="tactile-button" @click="clearSearch">Start again <ArrowRight :size="14" aria-hidden="true" /></button>
    </div>
    <div ref="resultList" @keydown.down="moveResult($event, 1)" @keydown.up="moveResult($event, -1)">
      <div v-if="!query.trim()" class="search-start">
        <p class="search-section-label">Or take the scenic route</p>
        <div class="search-destinations">
          <NuxtLink v-for="destination in destinations" :key="destination.href" :to="destination.href" data-search-result class="search-destination" @click="close">
            <span class="search-destination-icon"><component :is="destination.icon" :size="20" aria-hidden="true" /></span>
            <span><strong>{{ destination.name }}</strong><small>{{ destination.detail }}</small></span>
            <ArrowUpRight class="search-destination-arrow" :size="16" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
      <section v-for="group in visibleResults" :key="group.name" class="search-group">
        <h3 class="search-section-label"><component :is="groupIcons[group.name]" :size="13" aria-hidden="true" /> {{ group.name }} <span>{{ group.total }}</span></h3>
        <ul class="search-results">
          <li v-for="item in group.items" :key="item.href">
            <NuxtLink :to="item.href" :external="item.external" :target="item.external ? '_blank' : undefined" :rel="item.external ? 'noopener noreferrer' : undefined" data-search-result class="search-result" @click="close">
              <span class="search-result-copy"><strong>{{ item.title }}</strong><small>{{ item.detail }}</small><span v-if="item.external" class="sr-only">Opens in a new tab.</span></span>
              <ArrowUpRight v-if="item.external" class="search-result-arrow" :size="16" aria-hidden="true" /><ArrowRight v-else class="search-result-arrow" :size="16" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
        <button v-if="group.items.length < group.total" type="button" class="search-more" @click="expandedGroups.push(group.name)">Show all {{ group.total }} in {{ group.name.toLowerCase() }} <ArrowRight :size="13" aria-hidden="true" /></button>
      </section>
    </div>
    <footer class="search-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> to explore</span><span><kbd><CornerDownLeft :size="11" aria-hidden="true" /><span class="sr-only">Enter</span></kbd> to open</span><span><kbd>esc</kbd> to close</span></footer>
  </AccessibleDialog>
</template>

<style scoped>
.search-dialog { width: min(43rem, calc(100vw - 2rem)); }
.search-dialog :deep(.dialog-header) { padding-bottom: 1.3rem; border-bottom: 0; }
.search-dialog :deep(.dialog-content) { padding-top: 0; }
.search-field { display: flex; align-items: center; gap: .8rem; padding: 0 1rem; min-height: 3.7rem; background: hsl(var(--background)); border: 1px solid var(--studio-line, hsl(var(--border))); border-radius: .9rem; box-shadow: inset 0 2px 4px rgb(39 46 35 / 5%), 0 1px 0 rgb(255 255 255 / 45%); transition: border-color 160ms ease, box-shadow 160ms ease; }
.search-field:focus-within { border-color: var(--studio-accent, #2f6651); box-shadow: inset 0 2px 4px rgb(39 46 35 / 4%), 0 0 0 3px color-mix(in srgb, var(--studio-accent, #2f6651) 12%, transparent); }
.search-field-icon { flex-shrink: 0; color: var(--studio-accent, #2f6651); }
.search-field input { flex: 1; width: 0; min-width: 0; height: 3.5rem; background: transparent; font-size: 1rem; outline: none; }
.search-field input::placeholder { color: var(--studio-muted, hsl(var(--muted-foreground))); }
.search-field input::-webkit-search-cancel-button { display: none; }
.search-clear { display: grid; width: 2.75rem; height: 2.75rem; margin-right: -.5rem; flex-shrink: 0; place-items: center; color: hsl(var(--muted-foreground)); border-radius: .5rem; }
.search-escape, .search-footer kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 1.35rem; min-height: 1.35rem; padding: .1rem .3rem; border: 1px solid var(--studio-line, hsl(var(--border))); border-bottom-width: 2px; border-radius: .3rem; background: var(--studio-paper, hsl(var(--card))); color: var(--studio-muted, hsl(var(--muted-foreground))); font: .65rem var(--font-mono); }
.search-status { margin: .95rem 0 1.6rem; color: var(--studio-muted, hsl(var(--muted-foreground))); font-size: .75rem; line-height: 1.6; overflow-wrap: anywhere; }
.search-section-label { display: flex; align-items: center; gap: .5rem; margin-bottom: .75rem; color: var(--studio-muted, hsl(var(--muted-foreground))); font: 500 .62rem var(--font-mono); text-transform: uppercase; letter-spacing: .13em; }
.search-section-label > span { margin-left: auto; font-size: .6rem; letter-spacing: 0; }
.search-destinations { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; }
.search-destination { display: flex; align-items: center; gap: .75rem; min-height: 5.5rem; padding: 1rem; border: 1px solid var(--studio-line, hsl(var(--border))); border-radius: .8rem; background: hsl(var(--background) / .55); transition: background 160ms ease, border-color 160ms ease; }
.search-destination:hover, .search-destination:focus-visible { background: hsl(var(--muted) / .6); border-color: var(--studio-accent, #2f6651); }
.search-destination-icon { color: var(--studio-accent, #2f6651); }
.search-destination strong, .search-result strong { display: block; font-size: .8rem; font-weight: 550; line-height: 1.5; }
.search-destination small, .search-result small { display: block; margin-top: .25rem; color: var(--studio-muted, hsl(var(--muted-foreground))); font-size: .67rem; line-height: 1.6; }
.search-destination-arrow { margin-left: auto; flex-shrink: 0; color: var(--studio-muted, hsl(var(--muted-foreground))); }
.search-group + .search-group { margin-top: 1.5rem; }
.search-results { display: grid; gap: .15rem; }
.search-result { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 4.25rem; padding: .8rem .85rem; margin: 0 -.5rem; border: 1px solid transparent; border-radius: .65rem; transition: background 160ms ease, border-color 160ms ease; }
.search-result:hover, .search-result:focus-visible { background: hsl(var(--muted) / .6); border-color: var(--studio-line, hsl(var(--border))); }
.search-result-copy { min-width: 0; overflow-wrap: anywhere; }
.search-result small { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.search-result-arrow { flex-shrink: 0; color: var(--studio-accent, #2f6651); transition: transform 160ms ease; }
.search-result:hover .search-result-arrow { transform: translateX(3px); }
.search-more { display: flex; align-items: center; gap: .6rem; min-height: 2.75rem; margin-top: .3rem; color: var(--studio-accent, #2f6651); font-size: .7rem; }
.search-empty { display: flex; align-items: center; flex-direction: column; padding: 1.5rem .5rem 2.5rem; text-align: center; }
.search-empty-icon { display: grid; place-items: center; width: 3.5rem; height: 3.5rem; margin-bottom: 1rem; border: 1px solid var(--studio-line, hsl(var(--border))); border-radius: 50%; color: var(--studio-accent, #2f6651); }
.search-empty h3 { font-family: var(--font-serif); font-size: 1.3rem; }
.search-empty p { margin: .5rem 0 1.3rem; color: var(--studio-muted, hsl(var(--muted-foreground))); font-size: .8rem; line-height: 1.6; }
.search-empty .tactile-button { display: inline-flex; align-items: center; gap: .6rem; min-height: 2.75rem; padding: .65rem 1rem; font-size: .75rem; }
.search-error { margin: 0 0 1.25rem; font-size: .75rem; line-height: 1.7; color: hsl(var(--muted-foreground)); }
.search-error button { min-height: 2.75rem; text-decoration: underline; text-underline-offset: 3px; }
.search-footer { display: flex; flex-wrap: wrap; gap: .8rem 1.2rem; margin-top: 1.6rem; padding-top: 1rem; border-top: 1px solid var(--studio-line, hsl(var(--border))); color: var(--studio-muted, hsl(var(--muted-foreground))); font-size: .62rem; }
.search-footer > span { display: inline-flex; align-items: center; gap: .3rem; }
@media (max-width: 480px) { .search-dialog { width: calc(100vw - 1rem); } .search-destinations { gap: .5rem; } .search-destination { gap: .6rem; min-height: 5rem; padding: .75rem; } .search-destination-arrow { display: none; } .search-destination small { font-size: .6rem; } .search-footer { gap: .6rem; justify-content: space-between; } }
@media (pointer: coarse) { .search-footer { display: none; } }
@media (prefers-reduced-motion: reduce) { .search-result:hover .search-result-arrow { transform: none; } }
</style>
