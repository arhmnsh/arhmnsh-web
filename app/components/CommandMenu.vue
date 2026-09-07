<script setup lang="ts">
import { Search, ArrowRight } from 'lucide-vue-next'
import books from '../../content/books.json'
import bookmarks from '../../content/bookmarks.json'
import gallery from '../../content/gallery.json'
import { contentText } from '~/utils/contentText'

const { isOpen, close } = useCommandMenu()
const route = useRoute()
const query = ref('')
const input = ref<HTMLInputElement | null>(null)
const resultList = ref<HTMLElement | null>(null)
const { data, status, error, execute } = await useAsyncData('site-search-content', async () => {
  const [articles, shayris] = await Promise.all([
    queryCollection('articles').select('path', 'title', 'description', 'categories', 'body').all(),
    queryCollection('shayris').select('path', 'title', 'author', 'tags', 'body').all()
  ])
  return { articles, shayris }
}, { immediate: false })

type SearchItem = { title: string, detail: string, href: string, text: string, external?: boolean }
const normalize = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
const groups = computed(() => [
  { name: 'Articles', items: (data.value?.articles || []).map(a => ({ title: a.title, detail: a.description || a.categories.join(' · '), href: a.path, text: [a.title, a.description, a.categories.join(' '), contentText(a.body)].join(' ') })) },
  { name: 'Books', items: books.map(b => ({ title: b.title, detail: b.author, href: `/books?book=${encodeURIComponent(b.id)}`, text: [b.title, b.author, b.review].join(' ') })) },
  { name: 'Gallery', items: gallery.map(g => ({ title: g.title, detail: 'caption' in g ? String(g.caption) : g.platform, href: `/gallery?media=${encodeURIComponent(g.id)}`, text: [g.title, 'caption' in g ? g.caption : '', 'alt' in g ? g.alt : ''].join(' ') })) },
  { name: 'Shayris', items: (data.value?.shayris || []).map(s => ({ title: s.title, detail: s.author, href: s.path, text: [s.title, s.author, s.tags.join(' '), contentText(s.body)].join(' ') })) },
  { name: 'Bookmarks', items: (bookmarks as Array<{title: string, url: string, description?: string, tags: string[]}>).map(b => ({ title: b.title, detail: b.description || new URL(b.url).hostname, href: b.url, external: true, text: [b.title, b.url, b.description, b.tags.join(' ')].join(' ') })) }
] as { name: string, items: SearchItem[] }[])
const results = computed(() => {
  const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return groups.value.map(group => ({ ...group, items: group.items
    .filter(item => terms.every(term => normalize(item.text).includes(term)))
    .sort((a, b) => Number(normalize(b.title).includes(normalize(query.value))) - Number(normalize(a.title).includes(normalize(query.value))))
  })).filter(group => group.items.length)
})
const count = computed(() => results.value.reduce((total, group) => total + group.items.length, 0))
const focusResult = (index: number) => {
  const links = resultList.value?.querySelectorAll<HTMLElement>('[data-search-result]')
  if (!links?.length || index < 0) { input.value?.focus(); return }
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
const shortcut = (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    if (!isOpen.value && document.querySelector('dialog[open]')) return
    event.preventDefault()
    isOpen.value = !isOpen.value
  }
}
watch(() => route.fullPath, close)
watch(isOpen, async value => {
  if (value) {
    if (status.value === 'idle' || status.value === 'error') execute()
    await nextTick()
    input.value?.focus()
  } else query.value = ''
})
onMounted(() => window.addEventListener('keydown', shortcut))
onUnmounted(() => window.removeEventListener('keydown', shortcut))
</script>

<template>
  <AccessibleDialog v-model:open="isOpen" title="Search this site" description="Find articles, books, photographs, and published collections." close-label="Close search">
    <label for="site-search" class="sr-only">Search words</label>
    <div class="flex items-center gap-3 rounded-md border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
      <Search class="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input id="site-search" ref="input" v-model="query" type="search" autofocus autocomplete="off" placeholder="Try a title, author, or topic…" class="h-12 min-w-0 flex-1 bg-transparent text-base" aria-describedby="search-status" @keydown.down.prevent="focusResult(0)" @keydown.enter="openFirstResult" />
    </div>
    <p id="search-status" role="status" aria-live="polite" class="my-4 text-sm text-muted-foreground">{{ !query.trim() ? 'Start typing to explore the site.' : status === 'pending' ? 'Searching…' : `${count} ${count === 1 ? 'result' : 'results'} found.` }}</p>
    <p v-if="error" class="mb-4 text-sm text-muted-foreground">Articles could not be loaded. Books and photographs are still available. <button type="button" class="underline underline-offset-4" @click="execute()">Try again</button></p>
    <div v-if="query.trim() && !count && status !== 'pending'" class="py-4 text-sm text-muted-foreground"><p>Try fewer words, a book author, or a topic such as AI or design.</p><button type="button" class="mt-4 min-h-11 underline underline-offset-4" @click="query = ''; input?.focus()">Clear search</button></div>
    <div ref="resultList" @keydown.down="moveResult($event, 1)" @keydown.up="moveResult($event, -1)">
      <section v-for="group in results" :key="group.name" class="mt-5">
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ group.name }} <span class="font-normal">{{ group.items.length }}</span></h3>
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.href">
            <NuxtLink :to="item.href" :external="item.external" :target="item.external ? '_blank' : undefined" :rel="item.external ? 'noopener noreferrer' : undefined" data-search-result class="flex min-h-14 items-center justify-between gap-3 rounded-md px-3 py-3 hover:bg-muted/60 focus-visible:bg-muted/60" @click="close">
              <span class="min-w-0"><span class="block text-sm font-medium">{{ item.title }}</span><span class="mt-1 block text-xs leading-relaxed text-muted-foreground">{{ item.detail }}</span><span v-if="item.external" class="sr-only">Opens in a new tab.</span></span><ArrowRight class="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
    <p v-if="count" class="mt-5 text-xs text-muted-foreground">Use ↓ and ↑ to move through results, Enter to open, and Esc to close.</p>
  </AccessibleDialog>
</template>
